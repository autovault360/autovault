"use server";

import { getAuthContext } from "./auth-context";
import { getSalesRepsDashboard } from "@/lib/sales-reps/server/get-sales-reps-dashboard";
import {
  fetchJacketsInRangeExtended,
} from "@/services/deal-jacket.service";
import {
  buildSalesRepKpis,
  buildSalesRepTableRows,
  buildPeriodLabel,
} from "../admin/map-admin-dashboard-data";
import type { KPICardData } from "@/components/ui/kpi-card";
import type { AdminSalesRepTableRow } from "../admin/types";
import { getPeriodRange } from "./period-utils";

export async function getSalesRepSectionData(
  viewMode?: "monthly" | "yearly",
  month?: number,
  year?: number,
): Promise<{
  periodLabel: string;
  kpiCards: KPICardData[];
  tableRows: AdminSalesRepTableRow[];
}> {
  const auth = await getAuthContext();
  if (!auth) {
    return { periodLabel: "", kpiCards: [], tableRows: [] };
  }

  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const currentYear = year ?? now.getFullYear();
  const mode = viewMode ?? "monthly";

  const { from: periodFrom, to: periodTo } = getPeriodRange(mode, currentMonth, currentYear);

  const [salesRepData, jackets] = await Promise.all([
    getSalesRepsDashboard(mode === "yearly" ? "ytd" : "this_month"),
    fetchJacketsInRangeExtended(auth.dealershipId, periodFrom, periodTo),
  ]);

  return {
    periodLabel: buildPeriodLabel(periodFrom, periodTo),
    kpiCards: buildSalesRepKpis(salesRepData.salesReps, jackets),
    tableRows: buildSalesRepTableRows(salesRepData.salesReps, jackets),
  };
}
