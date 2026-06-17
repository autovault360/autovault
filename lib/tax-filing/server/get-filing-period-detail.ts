"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getFilingPeriodDetail } from "@/services/tax-filing.service";
import type { FilingPeriodDetail } from "@/lib/tax-filing/types";

export async function getFilingPeriodDetailAction(
  periodId: string,
): Promise<FilingPeriodDetail | null> {
  const auth = await authenticateUser();
  if (!auth.ok) return null;

  return getFilingPeriodDetail(periodId, auth.user.dealershipId);
}
