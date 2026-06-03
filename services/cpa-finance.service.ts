import type { CpaDashboardData, CpaViewMode } from "@/lib/cpa/types";
import { buildCpaDashboardData } from "@/lib/cpa/server/finance/build-dashboard";

export type CpaDashboardParams = {
  view: CpaViewMode;
  month: number;
  year: number;
};

export async function getCpaDashboardData(
  dealershipId: string,
  params: CpaDashboardParams,
): Promise<CpaDashboardData> {
  return buildCpaDashboardData(dealershipId, params);
}
