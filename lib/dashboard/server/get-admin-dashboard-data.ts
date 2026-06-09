"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getDashboardData } from "./get-dashboard-data";
import { getCalendarReport } from "@/lib/calendar/server/get-calendar-report";
import { getSalesRepsDashboard } from "@/lib/sales-reps/server/get-sales-reps-dashboard";
import {
  fetchJacketsInRangeExtended,
  type JacketRowExtended,
} from "@/services/deal-jacket.service";
import { getDealAggregates } from "@/services/deal-jacket.service";
import { getExpenseTotals } from "@/services/expense.service";
import { getDashboardInventoryPreview } from "@/services/vehicle.service";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { createClient } from "@/lib/supabase/server";
import type { ProfitLossPoint } from "@/lib/dealer/dashboard/types";
import { buildAdminDashboardMock } from "../admin/mock-data";
import { assembleAdminDashboardProps } from "../admin/map-admin-dashboard-data";
import { mergeAdminDashboardWithMock } from "../admin/merge-admin-dashboard-mock";
import type { AdminDashboardContentProps } from "../admin/types";

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

async function getWeeklyProfitLoss(
  dealershipId: string,
): Promise<ProfitLossPoint[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: Array<{ week: string; from: string; to: string }> = [];
  const weekRanges = [
    { label: "Week 1", start: 1, end: 7 },
    { label: "Week 2", start: 8, end: 14 },
    { label: "Week 3", start: 15, end: 21 },
    { label: "Week 4", start: 22, end: daysInMonth },
  ];

  for (const wr of weekRanges) {
    const from = new Date(year, month, wr.start).toISOString().slice(0, 10);
    const endDay = Math.min(wr.end, daysInMonth);
    const to = new Date(year, month, endDay).toISOString().slice(0, 10);
    weeks.push({ week: wr.label, from, to });
  }

  const points: ProfitLossPoint[] = [];
  for (const w of weeks) {
    const [agg, exp] = await Promise.all([
      getDealAggregates(dealershipId, w.from, w.to),
      getExpenseTotals(dealershipId, w.from, w.to),
    ]);
    points.push({
      week: w.week,
      revenue: agg.totalSales,
      expenses: exp.grandTotal,
    });
  }

  return points;
}

async function resolveJacketImages(
  jackets: JacketRowExtended[],
): Promise<Record<string, string | undefined>> {
  const supabase = await createClient();
  const map: Record<string, string | undefined> = {};
  const vehicleIds = [...new Set(jackets.map((j) => j.vehicle_id))];

  for (const vehicleId of vehicleIds) {
    const { data } = await supabase
      .from("vehicle_images")
      .select("storage_path")
      .eq("vehicle_id", vehicleId)
      .eq("is_primary", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data?.storage_path) {
      try {
        map[vehicleId] = await getSignedUrl(
          "vehicle-images",
          data.storage_path,
          3600,
        );
      } catch {
        map[vehicleId] = undefined;
      }
    }
  }

  return map;
}

export async function getAdminDashboardData(
  dealStatusFilter?: string,
): Promise<AdminDashboardContentProps> {
  const auth = await authenticateUser();
  const { from: periodFrom, to: periodTo } = monthRange(0);
  const today = new Date().toISOString().slice(0, 10);
  const mockOpts = { periodFrom, periodTo, today };

  if (!auth.ok) {
    return buildAdminDashboardMock(mockOpts);
  }

  const dealershipId = auth.user.dealershipId;
  const currentYear = new Date().getFullYear();

  const [
    dashData,
    calendarReport,
    salesRepData,
    jackets,
    inventoryRows,
    profitLossPoints,
  ] = await Promise.all([
    getDashboardData(dealStatusFilter),
    getCalendarReport(currentYear),
    getSalesRepsDashboard("this_month"),
    fetchJacketsInRangeExtended(dealershipId, periodFrom, periodTo),
    getDashboardInventoryPreview(dealershipId, 5),
    getWeeklyProfitLoss(dealershipId),
  ]);

  const jacketImageMap = await resolveJacketImages(jackets);

  return mergeAdminDashboardWithMock(
    assembleAdminDashboardProps({
      dashData,
      calendarReport,
      inventoryRows,
      profitLossPoints,
      salesReps: salesRepData.salesReps,
      salesRepStats: salesRepData.stats,
      jackets,
      jacketImageMap,
      periodFrom,
      periodTo,
      today,
      stickyNotes: buildAdminDashboardMock(mockOpts).stickyNotes,
    }),
    mockOpts,
  );
}
