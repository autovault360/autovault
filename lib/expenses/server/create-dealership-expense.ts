"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dealershipExpenseSchema } from "./schemas";
import type { ExpenseActionResult } from "./types";
import {
  getExpenseReceiptUrl,
  requireAuth,
  uploadExpenseReceipt,
} from "./upload-expense-receipt";

export async function createDealershipExpense(
  formData: FormData,
): Promise<ExpenseActionResult> {
  let receiptPath: string | null = null;

  try {
    const { userId, dealershipId } = await requireAuth();
    const raw = JSON.parse(formData.get("payload") as string);
    const data = dealershipExpenseSchema.parse(raw);

    const supabase = await createClient();

    const { data: row, error: insertError } = await supabase
      .from("dealership_expenses")
      .insert({
        dealership_id: dealershipId,
        expense_date: data.expenseDate,
        category: data.category,
        vendor: data.vendor,
        description: data.description,
        amount: data.amount,
        reference_number: data.referenceNumber || null,
        payment_method: data.paymentMethod || null,
        tax_deductible: data.taxDeductible,
        is_recurring: data.isRecurring,
        recurrence_frequency: data.recurrenceFrequency || null,
        recurrence_next_due_date: data.recurrenceNextDueDate || null,
        notes: data.notes || null,
        save_merchant: data.saveMerchant,
        created_by: userId,
      })
      .select("id")
      .single();

    if (insertError || !row) {
      throw new Error(insertError?.message ?? "Failed to create expense");
    }

    const receipt = formData.get("receipt") as File | null;
    if (receipt && receipt.size > 0) {
      receiptPath = await uploadExpenseReceipt(
        dealershipId,
        "dealership",
        row.id,
        receipt,
        userId,
      );
      const { error: updateError } = await supabase
        .from("dealership_expenses")
        .update({ receipt_storage_path: receiptPath })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }

    revalidatePath("/dashboard/expenses");
    return { success: true, expenseId: row.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getDealershipExpenseReceiptUrl(
  storagePath: string,
): Promise<string | null> {
  return getExpenseReceiptUrl(storagePath);
}
