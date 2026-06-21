import type { CpaViewMode } from "@/lib/cpa/types";
import type { CpaProfitVehiclesReportData } from "@/lib/cpa/profit-vehicles-report/types";
import { buildCpaProfitVehiclesReport } from "./build-profit-vehicles-report";

export async function fetchCpaProfitVehiclesReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaProfitVehiclesReportData> {
  return buildCpaProfitVehiclesReport(dealershipId, params);
}
