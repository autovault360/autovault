"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dealershipExpenseSchema, vehicleExpenseSchema } from "./schemas";
import type { ExpenseActionResult } from "./types";
import { requireAuth, uploadExpenseReceipt } from "./upload-expense-receipt";

export async function updateExpense(
  expenseKind: "dealership" | "vehicle",
  expenseId: string,
  formData: FormData,
): Promise<ExpenseActionResult> {
  try {
    const { userId, dealershipId } = await requireAuth();
    const supabase = await createClient();

    if (expenseKind === "dealership") {
      const raw = JSON.parse(formData.get("payload") as string);
      const data = dealershipExpenseSchema.parse(raw);

      const { error: fetchError } = await supabase
        .from("dealership_expenses")
        .select("id")
        .eq("id", expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .maybeSingle();

      if (fetchError) {
        return { success: false, error: "Expense not found" };
      }

      const { error: updateError } = await supabase
        .from("dealership_expenses")
        .update({
          expense_date: data.expenseDate,
          category: data.category,
          vendor: data.vendor,
          description: data.description,
          amount: data.amount,
          reference_number: data.referenceNumber || null,
          payment_method: data.paymentMethod || null,
          tax_deductible: data.taxDeductible,
          is_recurring: data.isRecurring,
          notes: data.notes || null,
          save_merchant: data.saveMerchant,
        })
        .eq("id", expenseId);

      if (updateError) throw new Error(updateError.message);

      const receipt = formData.get("receipt") as File | null;
      if (receipt && receipt.size > 0) {
        const receiptPath = await uploadExpenseReceipt(
          dealershipId,
          "dealership",
          expenseId,
          receipt,
          userId,
        );
        const { error: receiptError } = await supabase
          .from("dealership_expenses")
          .update({ receipt_storage_path: receiptPath })
          .eq("id", expenseId);
        if (receiptError) throw new Error(receiptError.message);
      }

      if (formData.get("removeReceipt") === "true") {
        const { error: clearError } = await supabase
          .from("dealership_expenses")
          .update({ receipt_storage_path: null })
          .eq("id", expenseId);
        if (clearError) throw new Error(clearError.message);
      }
    } else {
      const raw = JSON.parse(formData.get("payload") as string);
      const data = vehicleExpenseSchema.parse(raw);

      const { error: fetchError } = await supabase
        .from("vehicle_expenses")
        .select("id, vehicle_id")
        .eq("id", expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .maybeSingle();

      if (fetchError) {
        return { success: false, error: "Expense not found" };
      }

      const { error: updateError } = await supabase
        .from("vehicle_expenses")
        .update({
          vehicle_id: data.vehicleId,
          repair_date: data.expenseDate,
          repair_type: data.expenseSubcategory,
          expense_subcategory: data.expenseSubcategory,
          description: data.description,
          shop_vendor: data.vendor,
          total_cost: data.amount,
          payment_method: data.paymentMethod,
          invoice_number: data.referenceNumber || null,
          notes: data.notes || null,
        })
        .eq("id", expenseId);

      if (updateError) throw new Error(updateError.message);

      const receipt = formData.get("receipt") as File | null;
      if (receipt && receipt.size > 0) {
        const receiptPath = await uploadExpenseReceipt(
          dealershipId,
          "vehicle",
          expenseId,
          receipt,
          userId,
        );
        const { error: receiptError } = await supabase
          .from("vehicle_expenses")
          .update({ receipt_storage_path: receiptPath })
          .eq("id", expenseId);
        if (receiptError) throw new Error(receiptError.message);
      }

      if (formData.get("removeReceipt") === "true") {
        const { error: clearError } = await supabase
          .from("vehicle_expenses")
          .update({ receipt_storage_path: null })
          .eq("id", expenseId);
        if (clearError) throw new Error(clearError.message);
      }

      const { error: rpcError } = await supabase.rpc("update_vehicle_financials", {
        p_vehicle_id: data.vehicleId,
      });
      if (rpcError) throw new Error(rpcError.message);
    }

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { success: false, error: message };
  }
}
