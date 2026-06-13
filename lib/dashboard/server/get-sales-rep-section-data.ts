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

function monthRange(monthsAgo: number = 0): { from: string; to: string } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  const from = d.toISOString().slice(0, 7) + "-01";
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

export async function getSalesRepSectionData(): Promise<{
  periodLabel: string;
  kpiCards: KPICardData[];
  tableRows: AdminSalesRepTableRow[];
}> {
  const auth = await getAuthContext();
  if (!auth) {
    return { periodLabel: "", kpiCards: [], tableRows: [] };
  }

  const { from: periodFrom, to: periodTo } = monthRange(0);

  const [salesRepData, jackets] = await Promise.all([
    getSalesRepsDashboard("this_month"),
    fetchJacketsInRangeExtended(auth.dealershipId, periodFrom, periodTo),
  ]);

  return {
    periodLabel: buildPeriodLabel(periodFrom, periodTo),
    kpiCards: buildSalesRepKpis(salesRepData.salesReps, jackets),
    tableRows: buildSalesRepTableRows(salesRepData.salesReps, jackets),
  };
}
