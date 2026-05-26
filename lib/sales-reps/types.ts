export type SalesRepPerformanceStatus =
  | "top_performer"
  | "on_track"
  | "needs_attention"
  | "below_target";

export type SalesRepPeriod =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "ytd";

export type SalesRepListItem = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  unitsSold: number;
  unitsSoldDelta: string;
  unitsSoldDeltaColor: "green" | "red";
  unitsSoldSparkPoints: string;
  grossProfit: number;
  grossProfitDelta: string;
  grossProfitDeltaColor: "green" | "red";
  grossProfitSparkPoints: string;
  netProfit: number;
  netProfitDelta: string;
  netProfitDeltaColor: "green" | "red";
  netProfitSparkPoints: string;
  totalSales: number;
  totalSalesDelta: string;
  totalSalesDeltaColor: "green" | "red";
  totalSalesSparkPoints: string;
  avgGrossPerUnit: number;
  avgGrossDelta: string;
  avgGrossDeltaColor: "green" | "red";
  avgGrossSparkPoints: string;
  conversionRate: number;
  conversionDelta: string;
  conversionDeltaColor: "green" | "red";
  conversionSparkPoints: string;
  goalAmount: number;
  goalProgress: number;
  status: SalesRepPerformanceStatus;
};

export type SalesRepStats = {
  totalReps: number;
  activeReps: number;
  commissionsPaidMtd: number;
  commissionsPaidMtdDelta: string;
  commissionsPaidMtdDeltaColor: "green" | "red";
  commissionsPaidMtdSparkPoints: string;
  totalCommissionsYtd: number;
  totalCommissionsYtdDelta: string;
  totalCommissionsYtdDeltaColor: "green" | "red";
  totalCommissionsYtdSparkPoints: string;
};

export type SalesRepDashboardData = {
  salesReps: SalesRepListItem[];
  stats: SalesRepStats;
  error?: string;
};

export const SALES_REP_PERIODS: SalesRepPeriod[] = [
  "this_month",
  "last_month",
  "this_quarter",
  "ytd",
];

export function isSalesRepPeriod(value: string): value is SalesRepPeriod {
  return SALES_REP_PERIODS.includes(value as SalesRepPeriod);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getSalesRepInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatSalesRepStatus(status: SalesRepPerformanceStatus): string {
  const labels: Record<SalesRepPerformanceStatus, string> = {
    top_performer: "Top Performer",
    on_track: "On Track",
    needs_attention: "Needs Attention",
    below_target: "Below Target",
  };
  return labels[status];
}

export function getSalesRepStatusStyle(status: SalesRepPerformanceStatus): string {
  switch (status) {
    case "top_performer":
      return "bg-emerald-600/20 text-emerald-300 border-emerald-500/40";
    case "on_track":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "needs_attention":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "below_target":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function getGoalProgressColor(progress: number): string {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function getGoalBarColorByStatus(
  status: SalesRepPerformanceStatus,
): string {
  switch (status) {
    case "top_performer":
      return "bg-emerald-500";
    case "on_track":
      return "bg-blue-500";
    case "needs_attention":
      return "bg-amber-500";
    case "below_target":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
}

export function formatMetricDelta(
  current: number,
  previous: number,
  comparisonLabel = "last month",
): { text: string; color: "green" | "red" } {
  if (previous === 0 && current === 0) {
    return { text: `0% vs ${comparisonLabel}`, color: "green" };
  }
  if (previous === 0) {
    return { text: `↑ 100% vs ${comparisonLabel}`, color: "green" };
  }
  const pct = ((current - previous) / previous) * 100;
  const arrow = pct >= 0 ? "↑" : "↓";
  return {
    text: `${arrow} ${Math.abs(pct).toFixed(1)}% vs ${comparisonLabel}`,
    color: pct >= 0 ? "green" : "red",
  };
}

export function buildSparkPoints(values: number[]): string {
  if (values.length === 0) {
    return "0,40 55,32 110,28 165,20 220,12";
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = 220 / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = Math.round(index * step);
      const normalized = (value - min) / range;
      const y = Math.round(44 - normalized * 34);
      return `${x},${y}`;
    })
    .join(" ");
}

export const SALES_REP_STATUSES: SalesRepPerformanceStatus[] = [
  "top_performer",
  "on_track",
  "needs_attention",
  "below_target",
];
