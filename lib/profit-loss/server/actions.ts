"use server";

import type { PlFilters, ProfitLossReport } from "../types";
import { getProfitLossReport } from "./get-profit-loss-report";

export async function fetchProfitLossReportAction(
  filters: PlFilters,
): Promise<ProfitLossReport> {
  return getProfitLossReport(filters);
}
