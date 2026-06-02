"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertVehicleActive } from "@/lib/vehicles/server/utils";
import { vehicleExpenseSchema } from "./schemas";
import type { ExpenseActionResult } from "./types";
import { requireAuth, uploadExpenseReceipt } from "./upload-expense-receipt";

export async function createVehicleExpense(
  formData: FormData,
): Promise<ExpenseActionResult> {
  try {
    const { userId, dealershipId } = await requireAuth();
    const raw = JSON.parse(formData.get("payload") as string);
    const data = vehicleExpenseSchema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(
      supabase,
      data.vehicleId,
      dealershipId,
    );
    if (activeError) return { success: false, error: activeError };

    const { data: row, error: insertError } = await supabase
      .from("vehicle_expenses")
      .insert({
        vehicle_id: data.vehicleId,
        dealership_id: dealershipId,
        repair_date: data.expenseDate,
        category: "vehicle",
        repair_type: data.expenseSubcategory,
        expense_subcategory: data.expenseSubcategory,
        priority: "medium",
        description: data.description,
        labor_cost: 0,
        parts_cost: 0,
        other_fees: 0,
        total_cost: data.amount,
        shop_vendor: data.vendor,
        payment_method: data.paymentMethod,
        invoice_number: data.referenceNumber || null,
        payment_status: "paid",
        notes: data.notes || null,
        source: "expenses_module",
        created_by: userId,
      })
      .select("id")
      .single();

    if (insertError || !row) {
      throw new Error(insertError?.message ?? "Failed to create vehicle expense");
    }

    const receipt = formData.get("receipt") as File | null;
    if (receipt && receipt.size > 0) {
      const receiptPath = await uploadExpenseReceipt(
        dealershipId,
        "vehicle",
        row.id,
        receipt,
        userId,
      );
      const { error: updateError } = await supabase
        .from("vehicle_expenses")
        .update({ receipt_storage_path: receiptPath })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }

    const { error: rpcError } = await supabase.rpc("update_vehicle_financials", {
      p_vehicle_id: data.vehicleId,
    });
    if (rpcError) throw new Error(rpcError.message);

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "REPAIR_ADDED",
      new_values: {
        repair_category: data.expenseSubcategory,
        total_cost: data.amount,
        description: data.description,
        source: "expenses_module",
      },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${data.vehicleId}`);
    return { success: true, expenseId: row.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
