"use server";

import type { PlFilters, ProfitLossReport } from "../types";
import { DEFAULT_PL_FILTERS } from "../types";
import { getProfitLossReport } from "./get-profit-loss-report";

export async function fetchProfitLossReportAction(
  filters: PlFilters,
): Promise<ProfitLossReport> {
  return getProfitLossReport(filters);
}

export async function fetchProfitLossReportForPeriod(
  month: number,
  year: number,
  view: "monthly" | "yearly",
  overrides?: Partial<PlFilters>,
): Promise<ProfitLossReport> {
  const filters: PlFilters = { ...DEFAULT_PL_FILTERS, ...overrides };
  return getProfitLossReport(filters, { month, year, view });
}
