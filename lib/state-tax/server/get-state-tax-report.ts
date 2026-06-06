"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getStateTaxReport as getStateTaxReportFromService } from "@/services/state-tax.service";
import { STATE_TAX_MOCK_REPORT } from "@/lib/state-tax/mock-data";
import type { StateTaxReport } from "@/lib/state-tax/types";

export async function getStateTaxReport(): Promise<StateTaxReport> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return STATE_TAX_MOCK_REPORT;
  }

  try {
    return await getStateTaxReportFromService(auth.user.dealershipId);
  } catch (error) {
    console.warn("getStateTaxReport failed, falling back to mock:", error);
    return STATE_TAX_MOCK_REPORT;
  }
}
