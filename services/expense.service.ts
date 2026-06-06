import { createClient } from "@/lib/supabase/server";
import type { RawDealershipExpense, RawVehicleExpense } from "@/lib/profit-loss/server/aggregate-pl-data";

export type CategoryExpense = {
  category: string;
  amount: number;
  percent: number;
  color: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  payroll: "#22c55e",
  salary_wages: "#22c55e",
  rent: "#a855f7",
  advertising: "#f59e0b",
  utilities: "#06b6d4",
  software: "#ef4444",
  insurance: "#3b82f6",
  office: "#06b6d4",
  accounting: "#6b7280",
  other: "#6b7280",
  vehicle: "#3b82f6",
  reconditioning: "#3b82f6",
  auction_fees: "#f59e0b",
  transportation: "#06b6d4",
  parts_supplies: "#ef4444",
};

type ExpenseJoin = {
  amount: number;
  category: string;
  expense_date: string;
  description: string | null;
  vendor: string | null;
};

export async function fetchDealershipExpensesInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<RawDealershipExpense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dealership_expenses")
    .select("category, amount, expense_date")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("expense_date", from)
    .lte("expense_date", to);

  if (error) {
    console.warn("fetchDealershipExpensesInRange:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    category: row.category as string,
    amount: Number(row.amount),
    expense_date: row.expense_date as string,
  }));
}

export async function fetchVehicleExpensesForVehicles(
  dealershipId: string,
  vehicleIds: string[],
  from: string,
  to: string,
): Promise<RawVehicleExpense[]> {
  if (vehicleIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_expenses")
    .select("vehicle_id, total_cost, category, repair_type, repair_date")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("vehicle_id", vehicleIds)
    .gte("repair_date", from)
    .lte("repair_date", to);

  if (error) {
    console.warn("fetchVehicleExpensesForVehicles:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    vehicle_id: row.vehicle_id as string,
    total_cost: Number(row.total_cost),
    category: (row.category as string) ?? "",
    repair_type: (row.repair_type as string) ?? "",
    repair_date: row.repair_date as string,
  }));
}

export async function getExpenseTotals(
  dealershipId: string,
  from: string,
  to: string,
): Promise<{ dealershipTotal: number; vehicleTotal: number; grandTotal: number }> {
  const [dealershipExpenses, vehicleExpenses] = await Promise.all([
    fetchDealershipExpensesInRange(dealershipId, from, to),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("vehicle_expenses")
        .select("total_cost")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .gte("repair_date", from)
        .lte("repair_date", to);
      return (data ?? []) as { total_cost: number }[];
    })(),
  ]);

  const dealershipTotal = dealershipExpenses.reduce((s, e) => s + e.amount, 0);
  const vehicleTotal = vehicleExpenses.reduce((s, e) => s + Number(e.total_cost ?? 0), 0);

  return { dealershipTotal, vehicleTotal, grandTotal: dealershipTotal + vehicleTotal };
}

export async function getExpensesByCategory(
  dealershipId: string,
  from: string,
  to: string,
): Promise<CategoryExpense[]> {
  const dealershipExpenses = await fetchDealershipExpensesInRange(dealershipId, from, to);

  const catMap: Record<string, number> = {};
  for (const e of dealershipExpenses) {
    const cat = e.category || "other";
    catMap[cat] = (catMap[cat] ?? 0) + e.amount;
  }

  const total = Object.values(catMap).reduce((s, v) => s + v, 0);
  const entries = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      color: CATEGORY_COLORS[category] ?? "#6b7280",
    }))
    .sort((a, b) => b.amount - a.amount);

  return entries;
}

export async function getRecurringExpenses(
  dealershipId: string,
  from: string,
  to: string,
): Promise<{ id: string; vendor: string; category: string; amount: number; nextDue: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dealership_expenses")
    .select("id, vendor, category, amount, recurrence_next_due_date")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .eq("is_recurring", true)
    .not("recurrence_next_due_date", "is", null)
    .gte("recurrence_next_due_date", from)
    .lte("recurrence_next_due_date", to);

  if (error) {
    console.warn("getRecurringExpenses:", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    vendor: (r.vendor as string) ?? "",
    category: r.category as string,
    amount: Number(r.amount),
    nextDue: r.recurrence_next_due_date as string,
  }));
}

export async function getExpenseStats(
  dealershipId: string,
  mtdFrom: string,
  mtdTo: string,
  ytdFrom: string,
  ytdTo: string,
): Promise<{ mtdTotal: number; ytdTotal: number }> {
  const [mtd, ytd] = await Promise.all([
    getExpenseTotals(dealershipId, mtdFrom, mtdTo),
    getExpenseTotals(dealershipId, ytdFrom, ytdTo),
  ]);

  return { mtdTotal: mtd.grandTotal, ytdTotal: ytd.grandTotal };
}
