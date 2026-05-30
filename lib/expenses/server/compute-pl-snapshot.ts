"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";

export type PlSnapshot = {
  dealershipExpensesMtd: number;
  vehicleReconCostsMtd: number;
  totalExpensesMtd: number;
  dealGrossProfitMtd: number;
  netOperatingEstimate: number;
};

const EMPTY: PlSnapshot = {
  dealershipExpensesMtd: 0,
  vehicleReconCostsMtd: 0,
  totalExpensesMtd: 0,
  dealGrossProfitMtd: 0,
  netOperatingEstimate: 0,
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Foundation stub for future P&L page — aggregates MTD dealership expenses,
 * vehicle recon costs, and deal gross profit.
 */
export async function computePlSnapshot(): Promise<PlSnapshot> {
  const auth = await authenticateUser();
  if (!auth.ok) return EMPTY;

  const supabase = await createClient();
  const { dealershipId } = auth.user;
  const now = new Date();
  const from = formatDate(startOfMonth(now));
  const to = formatDate(now);

  const [dealershipRows, vehicleRows, dealRows] = await Promise.all([
    supabase
      .from("dealership_expenses")
      .select("amount")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("expense_date", from)
      .lte("expense_date", to),
    supabase
      .from("vehicle_expenses")
      .select("total_cost")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("repair_date", from)
      .lte("repair_date", to),
    supabase
      .from("deals")
      .select("total_price_otd, total_collected")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("sale_date", from)
      .lte("sale_date", to),
  ]);

  const dealershipExpensesMtd = (dealershipRows.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const vehicleReconCostsMtd = (vehicleRows.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_cost),
    0,
  );
  const totalExpensesMtd = dealershipExpensesMtd + vehicleReconCostsMtd;

  const dealGrossProfitMtd = (dealRows.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_collected ?? row.total_price_otd ?? 0),
    0,
  );

  return {
    dealershipExpensesMtd,
    vehicleReconCostsMtd,
    totalExpensesMtd,
    dealGrossProfitMtd,
    netOperatingEstimate: dealGrossProfitMtd - totalExpensesMtd,
  };
}
