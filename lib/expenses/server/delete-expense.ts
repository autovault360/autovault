"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteExpenseSchema } from "./schemas";
import type { ExpenseActionResult } from "./types";
import { requireAuth } from "./upload-expense-receipt";

export async function deleteExpense(
  input: unknown,
): Promise<ExpenseActionResult> {
  try {
    const { dealershipId } = await requireAuth();
    const data = deleteExpenseSchema.parse(input);
    const supabase = await createClient();
    const deletedAt = new Date().toISOString();

    if (data.expenseKind === "dealership") {
      const { data: row, error: fetchError } = await supabase
        .from("dealership_expenses")
        .select("id")
        .eq("id", data.expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .maybeSingle();

      if (fetchError || !row) {
        return { success: false, error: "Expense not found" };
      }

      const { error } = await supabase
        .from("dealership_expenses")
        .update({ deleted_at: deletedAt })
        .eq("id", data.expenseId);

      if (error) throw new Error(error.message);
    } else {
      const { data: row, error: fetchError } = await supabase
        .from("vehicle_expenses")
        .select("id, vehicle_id")
        .eq("id", data.expenseId)
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .maybeSingle();

      if (fetchError || !row) {
        return { success: false, error: "Expense not found" };
      }

      const { error } = await supabase
        .from("vehicle_expenses")
        .update({ deleted_at: deletedAt })
        .eq("id", data.expenseId);

      if (error) throw new Error(error.message);

      const { error: rpcError } = await supabase.rpc("update_vehicle_financials", {
        p_vehicle_id: row.vehicle_id,
      });
      if (rpcError) throw new Error(rpcError.message);

      revalidatePath("/dashboard/vehicles");
      revalidatePath(`/dashboard/vehicles/${row.vehicle_id}`);
    }

    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { success: false, error: message };
  }
}
