import type { KPICardData } from "@/components/ui/kpi-card";
import type { CalendarReport } from "@/lib/calendar/types";
import type {
  ActivityItem,
  ProfitLossPoint,
  VehicleStatus,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import type { SalesRepListItem } from "@/lib/sales-reps/types";
import type { DashboardData } from "@/services/report.service";
import type { RecentDeal } from "@/services/deal-jacket.service";
import type { JacketRowExtended } from "@/services/deal-jacket.service";
import type { TopVehicle } from "@/services/vehicle.service";
import type { StickyNote } from "@/lib/reports-reminders/types";
import type {
  AdminDashboardContentProps,
  AdminGrossProfitRow,
  AdminSalesRepTableRow,
  AdminTodayEvent,
} from "./types";

const EMPTY_SPARK = "";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDelta(change: string, positive: boolean): string {
  const cleaned = change.replace(/\.{3}\s*/g, "").trim();
  const prefix = positive ? "+" : "-";
  return `${prefix} ${cleaned} vs last month`;
}

function mapVehicleStatus(status: string): VehicleStatus {
  if (status === "sold") return "sold";
  if (status === "pending" || status === "in_recon" || status === "needs_attention") {
    return "pending";
  }
  return "in_inventory";
}

export function mapInventoryPreview(
  rows: Awaited<
    ReturnType<
      typeof import("@/services/vehicle.service").getDashboardInventoryPreview
    >
  >,
): WholesaleVehicle[] {
  return rows.map((v) => ({
    id: v.id,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    stockNumber: v.stockNumber,
    costs: {
      acquisition: v.totalInvested,
      auction: 0,
      transport: 0,
      recon: 0,
      storage: 0,
      dealerFees: 0,
    },
    marketValue: v.totalInvested,
    status: mapVehicleStatus(v.status),
    daysInLot: v.daysInLot,
    purchaseDate: v.purchaseDate,
    imageUrl: v.imageUrl,
  }));
}

export function mapRecentDealsToActivity(deals: RecentDeal[]): ActivityItem[] {
  return deals.map((deal, i) => ({
    id: `deal-${i}`,
    action: `Sold ${deal.vehicleTitle}`,
    detail: `${deal.customerName} | ${formatCurrency(deal.salesPrice)}`,
    timestamp: formatRelativeTime(deal.dateSold),
    icon: "sold" as const,
  }));
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function buildKpiCards(dashData: DashboardData): KPICardData[] {
  const { kpis, comparison, profitLoss, inventoryValue, dealJacketStatus } =
    dashData;

  const totalSalesComp = comparison[0];
  const grossComp = comparison[1];
  const netComp = comparison[2];
  const expenseComp = comparison[3];

  return [
    {
      ...kpis.totalInventory,
      label: "Vehicles in Inventory",
      unit: `Total Value: ${formatCurrency(inventoryValue)}`,
      link: "View Inventory",
      sparkColor: kpis.totalInventory.sparkColor,
      sparkPoints: EMPTY_SPARK,
    },
    {
      ...kpis.soldThisMonth,
      label: "Vehicles Sold This Month",
      unit: `Total Sales: ${formatCurrency(profitLoss.totalIncome)}`,
      link: "View Sales",
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "dollar-sign",
      color: "violet",
      label: "Total Retail Revenue",
      value: formatCurrency(profitLoss.totalIncome),
      delta: totalSalesComp
        ? formatDelta(totalSalesComp.change, totalSalesComp.positive)
        : undefined,
      link: "View Revenue",
      sparkColor: "#a855f7",
      sparkPoints: EMPTY_SPARK,
    },
    {
      ...kpis.monthlyExpenses,
      label: "Total Expenses",
      delta: expenseComp
        ? formatDelta(expenseComp.change, !expenseComp.positive)
        : kpis.monthlyExpenses.delta,
      link: "View Expenses",
      sparkPoints: EMPTY_SPARK,
    },
    {
      ...kpis.grossProfitMtd,
      label: "Gross Profit",
      delta: grossComp
        ? formatDelta(grossComp.change, grossComp.positive)
        : kpis.grossProfitMtd.delta,
      sparkPoints: EMPTY_SPARK,
    },
    {
      ...kpis.netProfitMtd,
      label: "Net Profit",
      delta: netComp
        ? formatDelta(netComp.change, netComp.positive)
        : kpis.netProfitMtd.delta,
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "handshake",
      color: "amber",
      label: "Pending Deal Jackets",
      value: String(dealJacketStatus.inProgress),
      unit: "Requires Review",
      link: "View Deal Jackets",
      sparkColor: "#f59e0b",
      sparkPoints: EMPTY_SPARK,
    },
  ];
}

export function buildSalesRepKpis(
  salesReps: SalesRepListItem[],
  jackets: JacketRowExtended[],
): KPICardData[] {
  const totalCars = salesReps.reduce((s, r) => s + r.unitsSold, 0);
  const totalGross = salesReps.reduce((s, r) => s + r.grossProfit, 0);
  const totalCommission = jackets.reduce(
    (s, j) => s + Number(j.commission_amount ?? 0),
    0,
  );
  const pendingCommission = jackets
    .filter((j) => j.commission_status !== "paid" && j.commission_status !== "rejected")
    .reduce((s, j) => s + Number(j.commission_amount ?? 0), 0);
  const paidCommission = jackets
    .filter((j) => j.commission_status === "paid")
    .reduce((s, j) => s + Number(j.commission_amount ?? 0), 0);

  const topDelta = salesReps[0]?.grossProfitDelta ?? "+0%";

  return [
    {
      icon: "car",
      color: "blue",
      label: "Total Cars Sold",
      value: String(totalCars),
      delta: `${topDelta} vs last month`,
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Gross Profit Generated",
      value: formatCurrency(totalGross),
      delta: `${topDelta} vs last month`,
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "percent",
      color: "green",
      label: "Total Commission Earned",
      value: formatCurrency(totalCommission),
      delta: `${topDelta} vs last month`,
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "tag",
      color: "amber",
      label: "Pending Commission",
      value: formatCurrency(pendingCommission),
      unit: `${jackets.filter((j) => j.commission_status !== "paid" && j.commission_status !== "rejected").length} Deals Pending`,
      link: "View Details",
      sparkColor: "#f59e0b",
      sparkPoints: EMPTY_SPARK,
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Paid Commission",
      value: formatCurrency(paidCommission),
      delta: `${topDelta} vs last month`,
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints: EMPTY_SPARK,
    },
  ];
}

export function buildSalesRepTableRows(
  salesReps: SalesRepListItem[],
  jackets: JacketRowExtended[],
): AdminSalesRepTableRow[] {
  const sorted = [...salesReps].sort((a, b) => b.grossProfit - a.grossProfit);

  return sorted.map((rep, i) => {
    const repJackets = jackets.filter((j) => j.sales_rep_id === rep.id);
    const commissionEarned = repJackets.reduce(
      (s, j) => s + Number(j.commission_amount ?? 0),
      0,
    );
    const pendingCommission = repJackets
      .filter((j) => j.commission_status !== "paid" && j.commission_status !== "rejected")
      .reduce((s, j) => s + Number(j.commission_amount ?? 0), 0);
    const hasPending = repJackets.some(
      (j) => j.commission_status !== "paid" && j.commission_status !== "rejected",
    );

    return {
      rank: i + 1,
      id: rep.id,
      name: rep.fullName,
      imageUrl: rep.imageUrl,
      carsSold: rep.unitsSold,
      grossProfit: rep.grossProfit,
      commissionEarned,
      pendingCommission,
      payrollStatus: hasPending ? "Pending" : "Paid",
    };
  });
}

export function mapGrossProfitRows(
  jackets: JacketRowExtended[],
  imageMap: Record<string, string | undefined>,
): AdminGrossProfitRow[] {
  return jackets.map((j) => {
    const vehicle = Array.isArray(j.vehicle) ? j.vehicle[0] : j.vehicle;
    const purchaseCost = Number(vehicle?.acquisition_cost ?? j.total_invested ?? 0);
    const totalCost = Number(j.total_invested ?? 0);
    const reconCost = Math.max(0, totalCost - purchaseCost);
    const soldPrice = Number(j.sold_price ?? 0);
    const grossProfit = Number(j.profit_gross ?? 0);
    const commissionEarned = Number(j.commission_amount ?? 0);
    const commissionRate =
      grossProfit > 0
        ? Math.round((commissionEarned / grossProfit) * 1000) / 10
        : 0;

    return {
      id: j.id,
      vehicleLabel: vehicle
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        : "Unknown Vehicle",
      imageUrl: imageMap[j.vehicle_id],
      stockNumber: vehicle?.stock_number ?? "N/A",
      saleDate: j.date_sold?.slice(0, 10) ?? "",
      purchaseCost,
      reconCost,
      totalCost,
      salePrice: soldPrice,
      grossProfit,
      commissionRate,
      commissionEarned,
      salesRepId: j.sales_rep_id,
      dealType: Number(j.amount_financed ?? 0) > 0 ? "financed" : "cash",
    };
  });
}

export function buildTodayEvents(
  calendarReport: CalendarReport,
  today: string,
): AdminTodayEvent[] {
  const activity = calendarReport.dailyActivity.find((d) => d.date === today);
  if (activity?.events?.length) {
    return activity.events.map((ev) => ({
      id: ev.id,
      time: ev.time,
      title: ev.title,
      type: ev.type,
    }));
  }

  return calendarReport.upcomingEvents
    .filter((ev) => ev.date === today)
    .map((ev) => ({
      id: ev.id,
      time: "All Day",
      title: ev.title,
      type: "task",
    }));
}

export function buildPeriodLabel(from: string, to: string): string {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = toDate.getFullYear();
  return `${fmt(fromDate)} - ${fmt(toDate)}, ${year}`;
}

export function assembleAdminDashboardProps(input: {
  dashData: DashboardData;
  calendarReport: CalendarReport;
  inventoryRows: Awaited<
    ReturnType<
      typeof import("@/services/vehicle.service").getDashboardInventoryPreview
    >
  >;
  profitLossPoints: ProfitLossPoint[];
  salesReps: SalesRepListItem[];
  salesRepStats: import("@/lib/sales-reps/types").SalesRepStats;
  jackets: JacketRowExtended[];
  jacketImageMap: Record<string, string | undefined>;
  periodFrom: string;
  periodTo: string;
  today: string;
  stickyNotes: StickyNote[];
}): AdminDashboardContentProps {
  const {
    dashData,
    calendarReport,
    inventoryRows,
    profitLossPoints,
    salesReps,
    salesRepStats,
    jackets,
    jacketImageMap,
    periodFrom,
    periodTo,
    today,
    stickyNotes,
  } = input;

  const topVehicle = dashData.topVehicles[0] ?? null;
  const topSalesRep =
    [...salesReps].sort((a, b) => b.grossProfit - a.grossProfit)[0] ?? null;

  const vehicleProfitCounts = new Map<string, number>();
  for (const v of dashData.topVehicles) {
    vehicleProfitCounts.set(v.title, (vehicleProfitCounts.get(v.title) ?? 0) + 1);
  }
  const topVehicleUnitsSold = topVehicle
    ? vehicleProfitCounts.get(topVehicle.title) ?? 1
    : 0;

  return {
    periodLabel: buildPeriodLabel(periodFrom, periodTo),
    kpiCards: buildKpiCards(dashData),
    calendarReport,
    inventoryVehicles: mapInventoryPreview(inventoryRows),
    profitLossPoints,
    profitLossSummary: {
      totalRevenue: dashData.profitLoss.totalIncome,
      totalExpenses: dashData.profitLoss.totalExpenses,
      netProfit: dashData.profitLoss.netProfit,
    },
    activities: mapRecentDealsToActivity(dashData.recentDeals),
    topVehicle,
    topVehicleUnitsSold,
    topSalesRep,
    todayEvents: buildTodayEvents(calendarReport, today),
    salesRepKpis: buildSalesRepKpis(salesReps, jackets),
    salesRepTableRows: buildSalesRepTableRows(salesReps, jackets),
    salesRepStats,
    grossProfitRows: mapGrossProfitRows(jackets, jacketImageMap),
    grossProfitPeriodLabel: buildPeriodLabel(periodFrom, periodTo),
    stickyNotes,
  };
}
