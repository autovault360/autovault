import type { CpaDashboardData, CpaKpi, CpaViewMode } from "@/lib/cpa/types";
import type { KPICardData, KPIIconName } from "@/components/ui/kpi-card";

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatMoney(n: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(n);
}

export function formatPercent(n: number, fractionDigits = 2) {
  return `${n.toFixed(fractionDigits)}%`;
}

export function formatMonthDateRange(month: number, year: number) {
  const monthName = MONTH_NAMES_FULL[month - 1] ?? "January";
  const lastDay = new Date(year, month, 0).getDate();
  return `${monthName} 1 – ${monthName} ${lastDay}, ${year}`;
}

export function formatYearDateRange(year: number) {
  return `January 1 – December 31, ${year}`;
}

export function formatPeriodDateRange(
  view: CpaViewMode,
  month: number,
  year: number,
) {
  return view === "yearly"
    ? formatYearDateRange(year)
    : formatMonthDateRange(month, year);
}

export function formatPeriodStatusLine(
  view: CpaViewMode,
  month: number,
  year: number,
) {
  const range = formatPeriodDateRange(view, month, year);
  return `Showing data for ${range}`;
}

const cpaColorToTailwind: Record<string, string> = {
  green: "green",
  purple: "violet",
  blue: "blue",
  red: "red",
  teal: "teal",
  orange: "orange",
};

const cpaColorToHex: Record<string, string> = {
  green: "#10b981",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  red: "#ef4444",
  teal: "#06b6d4",
  orange: "#f59e0b",
};

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

export function toKpiCardData(
  kpi: CpaKpi,
  prevPeriodLabel: string,
): KPICardData {
  const direction = kpi.delta.includes("?")
    ? "up"
    : kpi.delta.includes("?")
      ? "down"
      : "flat";

  return {
    icon: kpi.icon as KPIIconName,
    color: cpaColorToTailwind[kpi.color] || "blue",
    label: kpi.label,
    value: kpi.value,
    trend: {
      percent: kpi.delta.replace(/[??]\s*/, ""),
      comparisonLabel: `vs ${prevPeriodLabel}`,
      direction,
      sentiment: kpi.deltaPositive ? "positive" : "negative",
    },
    link: "View Details",
    sparkColor: cpaColorToHex[kpi.color] || "#3b82f6",
    sparkPoints,
  };
}

export function vehicleHighlightText(
  highlight: { amount: number; vehicle: string },
  prefix = "",
) {
  if (highlight.amount === 0 && highlight.vehicle === "N/A") return "N/A";
  return `${prefix}${formatMoney(highlight.amount)} (${highlight.vehicle})`;
}

export type CpaDashboardPanels = Pick<
  CpaDashboardData,
  | "vehicleProfitStats"
  | "vehicleLossStats"
  | "salesTaxPanel"
  | "payrollPanel"
  | "expensePanel"
>;
