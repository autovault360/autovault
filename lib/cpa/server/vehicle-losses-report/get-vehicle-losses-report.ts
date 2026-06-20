import type { CpaViewMode } from "@/lib/cpa/types";
import type { CpaVehicleLossesReportData } from "@/lib/cpa/vehicle-losses-report/types";
import { buildCpaVehicleLossesReport } from "./build-vehicle-losses-report";

export async function fetchCpaVehicleLossesReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaVehicleLossesReportData> {
  return buildCpaVehicleLossesReport(dealershipId, params);
}
