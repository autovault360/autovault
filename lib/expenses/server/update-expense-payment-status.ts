"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseActionResult } from "./types";
import { requireAuth } from "./upload-expense-receipt";

export async function updateExpensePaymentStatus(
  expenseKind: "dealership" | "vehicle",
  expenseId: string,
  paymentStatus: "paid" | "unpaid" | "partial",
): Promise<ExpenseActionResult> {
  try {
    const { dealershipId } = await requireAuth();
    const supabase = await createClient();

    if (expenseKind === "vehicle") {
      const { error } = await supabase
        .from("vehicle_expenses")
        .update({ payment_status: paymentStatus })
        .eq("id", expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null);

      if (error) throw new Error(error.message);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const { data: row, error: fetchError } = await supabase
        .from("dealership_expenses")
        .select("is_recurring, expense_date")
        .eq("id", expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .maybeSingle();

      if (fetchError || !row) {
        return { success: false, error: "Expense not found" };
      }

      const { error } = await supabase
        .from("dealership_expenses")
        .update({
          recurrence_next_due_date:
            paymentStatus === "paid"
              ? row.expense_date
              : row.is_recurring
                ? today
                : null,
        })
        .eq("id", expenseId);

      if (error) throw new Error(error.message);
    }

    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { success: false, error: message };
  }
}
