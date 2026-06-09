import type { KPICardData } from "@/components/ui/kpi-card";
import type { CalendarReport } from "@/lib/calendar/types";
import type { ProfitLossPoint } from "@/lib/dealer/dashboard/types";
import type { AdminDashboardContentProps } from "./types";
import { buildAdminDashboardMock } from "./mock-data";

function shouldUseMockKpis(kpis: KPICardData[]): boolean {
  if (kpis.length === 0) return true;
  const inventoryValue = kpis[0]?.value ?? "0";
  return inventoryValue === "0" || inventoryValue === "$0";
}

function countActiveDaysInMonth(
  report: CalendarReport,
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return report.dailyActivity.filter(
    (day) =>
      day.date.startsWith(prefix) &&
      (day.events.length > 0 || day.unitsSold > 0),
  ).length;
}

function shouldUseMockCalendar(report: CalendarReport): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (report.dailyActivity.length === 0) return true;
  return countActiveDaysInMonth(report, year, month) < 3;
}

function shouldUseMockProfitLoss(points: ProfitLossPoint[]): boolean {
  if (points.length === 0) return true;
  return points.every((point) => point.revenue === 0 && point.expenses === 0);
}

function shouldUseMockProfitLossSummary(
  live: AdminDashboardContentProps,
): boolean {
  return (
    live.profitLossSummary.totalRevenue === 0 &&
    live.profitLossSummary.netProfit === 0
  );
}

function shouldUseMockSalesRepKpis(kpis: KPICardData[]): boolean {
  if (kpis.length === 0) return true;
  const sold = kpis[0]?.value ?? "0";
  return sold === "0";
}

export function mergeAdminDashboardWithMock(
  live: AdminDashboardContentProps,
  opts?: { periodFrom?: string; periodTo?: string; today?: string },
): AdminDashboardContentProps {
  const mock = buildAdminDashboardMock(opts);

  return {
    periodLabel: live.periodLabel || mock.periodLabel,
    kpiCards: shouldUseMockKpis(live.kpiCards) ? mock.kpiCards : live.kpiCards,
    calendarReport: shouldUseMockCalendar(live.calendarReport)
      ? mock.calendarReport
      : live.calendarReport,
    inventoryVehicles:
      live.inventoryVehicles.length >= 3
        ? live.inventoryVehicles
        : mock.inventoryVehicles,
    profitLossPoints: shouldUseMockProfitLoss(live.profitLossPoints)
      ? mock.profitLossPoints
      : live.profitLossPoints,
    profitLossSummary: shouldUseMockProfitLossSummary(live)
      ? mock.profitLossSummary
      : live.profitLossSummary,
    activities:
      live.activities.length >= 3 ? live.activities : mock.activities,
    topVehicle: live.topVehicle ?? mock.topVehicle,
    topVehicleUnitsSold: live.topVehicle
      ? live.topVehicleUnitsSold
      : mock.topVehicleUnitsSold,
    topSalesRep: live.topSalesRep ?? mock.topSalesRep,
    todayEvents:
      live.todayEvents.length >= 1 ? live.todayEvents : mock.todayEvents,
    salesRepKpis: shouldUseMockSalesRepKpis(live.salesRepKpis)
      ? mock.salesRepKpis
      : live.salesRepKpis,
    salesRepTableRows:
      live.salesRepTableRows.length >= 3
        ? live.salesRepTableRows
        : mock.salesRepTableRows,
    salesRepStats:
      live.salesRepStats.totalReps > 0
        ? live.salesRepStats
        : mock.salesRepStats,
    grossProfitRows:
      live.grossProfitRows.length >= 5
        ? live.grossProfitRows
        : mock.grossProfitRows,
    grossProfitPeriodLabel:
      live.grossProfitPeriodLabel || mock.grossProfitPeriodLabel,
    stickyNotes:
      live.stickyNotes.length >= 1 ? live.stickyNotes : mock.stickyNotes,
  };
}
