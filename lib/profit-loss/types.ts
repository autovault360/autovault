export { formatCurrency, formatDisplayDate } from "@/lib/expenses/types";

export type PlDateRange = "this_month" | "last_month" | "prior_month";
export type PlCompareTo = "last_month" | "last_year" | "none";
export type PlGroupBy = "none" | "sales_rep" | "location" | "deal_type";
export type PlTab = "statement" | "revenue" | "expense" | "trends";

export type PlKpiId =
  | "total_revenue"
  | "total_cogs"
  | "gross_profit"
  | "total_expenses"
  | "net_profit"
  | "net_profit_margin";

export type PlRowKind = "section-header" | "line-item" | "subtotal" | "total";

export type PlSection =
  | "revenue"
  | "cogs"
  | "gross_profit"
  | "operating_expenses"
  | "net_operating_income"
  | "taxes"
  | "net_profit";

export type PlKpiMetric = {
  id: PlKpiId;
  label: string;
  value: number;
  valueFormatted: string;
  delta: string;
  deltaDirection: "up" | "down" | "flat";
  deltaSentiment: "positive" | "negative" | "neutral";
  comparisonLabel: string;
  iconColor: "green" | "red" | "purple" | "orange" | "blue" | "teal";
};

export type PlTableRow = {
  id: string;
  kind: PlRowKind;
  section?: PlSection;
  label: string;
  thisMonth: number | null;
  lastMonth: number | null;
  showInfo?: boolean;
};

export type PlTrendPoint = {
  date: string;
  label: string;
  netProfit: number;
};

export type CategoryAmount = {
  id: string;
  label: string;
  amount: number;
  lastMonth: number;
  percentOfTotal: number;
};

export type PlInsight = {
  id: string;
  text: string;
  icon: "check" | "car" | "package" | "bag";
};

export type ProfitLossMeta = {
  generatedAt: string;
  generatedBy: string;
  currency: string;
  basis: "cash" | "accrual";
  dataSource: string;
  reportType: string;
};

export type ProfitLossPeriod = {
  start: string;
  end: string;
  label: string;
  columnLabel: string;
};

export type ProfitLossReport = {
  meta: ProfitLossMeta;
  period: ProfitLossPeriod;
  comparisonPeriod: ProfitLossPeriod;
  kpis: PlKpiMetric[];
  statementRows: PlTableRow[];
  dailyTrend: PlTrendPoint[];
  revenueBreakdown: CategoryAmount[];
  expenseBreakdown: CategoryAmount[];
  insights: PlInsight[];
  soldVehicleCount: number;
  comparisonDailyTrend: PlTrendPoint[];
};

export type PlFilters = {
  dateRange: PlDateRange;
  compareTo: PlCompareTo;
  groupBy: PlGroupBy;
  salesRep: string;
  location: string;
  dealType: string;
  search: string;
};

export type PlFilterOptions = {
  dateRangeOptions: { value: PlDateRange; label: string }[];
  salesReps: { value: string; label: string }[];
  locations: { value: string; label: string }[];
  dealTypes: { value: string; label: string }[];
};

export const DEFAULT_PL_FILTERS: PlFilters = {
  dateRange: "this_month",
  compareTo: "last_month",
  groupBy: "none",
  salesRep: "all",
  location: "all",
  dealType: "all",
  search: "",
};

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPoints(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} pts`;
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

export function computeChange(current: number, previous: number): {
  dollar: number;
  percent: number;
} {
  const dollar = current - previous;
  const percent = previous === 0 ? 0 : (dollar / Math.abs(previous)) * 100;
  return { dollar, percent };
}
