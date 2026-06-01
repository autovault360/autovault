"use server";

/**
 * @deprecated Use getProfitLossReport from get-profit-loss-report.ts for full P&L.
 * Kept for backward compatibility with any callers expecting coarse MTD totals.
 */
import { getProfitLossReport } from "@/lib/profit-loss/server/get-profit-loss-report";
import { DEFAULT_PL_FILTERS } from "@/lib/profit-loss/types";

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

export async function computePlSnapshot(): Promise<PlSnapshot> {
  const report = await getProfitLossReport(DEFAULT_PL_FILTERS);

  return {
    dealershipExpensesMtd: report.expenseBreakdown.reduce((s, e) => s + e.amount, 0),
    vehicleReconCostsMtd: report.statementRows.find((r) => r.id === "reconditioning")
      ?.thisMonth ?? 0,
    totalExpensesMtd: report.kpis.find((k) => k.id === "total_expenses")?.value ?? 0,
    dealGrossProfitMtd: report.kpis.find((k) => k.id === "gross_profit")?.value ?? 0,
    netOperatingEstimate: report.kpis.find((k) => k.id === "net_profit")?.value ?? 0,
  };
}

export { EMPTY };
