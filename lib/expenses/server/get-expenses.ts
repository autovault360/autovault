"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { ExpenseDetail } from "../types";
import type { DbDealershipExpense, DbVehicleExpense } from "./types";
import { mapDealershipExpense, mapVehicleExpense } from "./types";
import { getExpenseReceiptUrl } from "./upload-expense-receipt";

async function resolveAddedByName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  return data?.name ?? "Unknown";
}

export async function getExpenses(): Promise<ExpenseDetail[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const [dealershipResult, vehicleResult] = await Promise.all([
    supabase
      .from("dealership_expenses")
      .select("*")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("vehicle_expenses")
      .select(`
        *,
        vehicles(year, make, model, trim, stock_number, vin)
      `)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .order("repair_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const userIds = new Set<string>();
  for (const row of dealershipResult.data ?? []) {
    userIds.add(row.created_by);
  }
  for (const row of vehicleResult.data ?? []) {
    userIds.add(row.created_by);
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", [...userIds]);

  const nameById = new Map(
    (users ?? []).map((u) => [u.id, (u.full_name as string) ?? "Unknown"]),
  );

  const dealershipRows = (dealershipResult.data ?? []) as DbDealershipExpense[];
  const vehicleRows = (vehicleResult.data ?? []) as DbVehicleExpense[];

  const mapped: ExpenseDetail[] = [];

  for (const row of dealershipRows) {
    const receiptUrl = await getExpenseReceiptUrl(row.receipt_storage_path);
    mapped.push(
      mapDealershipExpense(
        row,
        receiptUrl,
        nameById.get(row.created_by) ?? "Unknown",
      ),
    );
  }

  for (const row of vehicleRows) {
    const receiptUrl = await getExpenseReceiptUrl(row.receipt_storage_path);
    mapped.push(
      mapVehicleExpense(
        row,
        receiptUrl,
        nameById.get(row.created_by) ?? "Unknown",
      ),
    );
  }

  mapped.sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return mapped;
}

export async function getExpenseById(
  expenseKind: "dealership" | "vehicle",
  expenseId: string,
): Promise<ExpenseDetail | null> {
  const expenses = await getExpenses();
  return expenses.find(
    (e) => e.id === expenseId && e.expenseKind === expenseKind,
  ) ?? null;
}
