import type { KPIIconName } from "@/components/ui/kpi-card";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";

export type DealerPlTimeframe =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "custom";

export type DealerPlSection =
  | "income"
  | "cogs"
  | "gross_profit"
  | "operating_expenses"
  | "net_profit";

export type DealerPlRowKind =
  | "section-header"
  | "line-item"
  | "subtotal"
  | "total"
  | "metric";

export type DealerPlTableRow = {
  id: string;
  kind: DealerPlRowKind;
  section?: DealerPlSection;
  label: string;
  thisMonth: number | null;
  lastMonth: number | null;
  /** When true, values render as percentages instead of currency. */
  isPercent?: boolean;
};

export type DealerPlTrendPoint = {
  label: string;
  revenue: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
};

export type DealerPlBreakdownItem = {
  id: string;
  label: string;
  amount: number;
  percentOfTotal: number;
  color: string;
};

export type DealerPlExpenseSegment = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type DealerPlPeriod = {
  start: string;
  end: string;
  label: string;
  columnLabel: string;
  comparisonColumnLabel: string;
  comparisonLabel: string;
};

export type DealerPlKpiStats = {
  totalRevenue: number;
  totalRevenueDelta: string;
  grossProfit: number;
  grossProfitDelta: string;
  totalExpenses: number;
  totalExpensesDelta: string;
  netProfit: number;
  netProfitDelta: string;
  grossMargin: number;
  grossMarginDelta: string;
};

export type DealerProfitLossData = {
  period: DealerPlPeriod;
  kpis: DealerPlKpiStats;
  statementRows: DealerPlTableRow[];
  monthlyTrend: DealerPlTrendPoint[];
  expenseSegments: DealerPlExpenseSegment[];
  expenseTotal: number;
  topIncomeSources: DealerPlBreakdownItem[];
  topExpenseCategories: DealerPlBreakdownItem[];
  timeframeOptions: { value: DealerPlTimeframe; label: string }[];
};

export type DealerPlKpiTrend = {
  percent: string;
  comparisonLabel: string;
  direction: "up" | "down" | "flat";
  sentiment: "positive" | "negative" | "neutral";
};

export type DealerPlKpiCard = {
  icon: KPIIconName;
  color: string;
  label: string;
  value: string;
  delta?: string;
  trend?: DealerPlKpiTrend;
  link: string;
  sparkColor: string;
  sparkPoints: string;
  deltaColor?: "green" | "red";
};

export function parseDealerPlDelta(delta: string): DealerPlKpiTrend {
  const trimmed = delta.trim();
  const direction: DealerPlKpiTrend["direction"] = trimmed.startsWith("↓")
    ? "down"
    : trimmed.startsWith("↑")
      ? "up"
      : "flat";
  const rest = trimmed.replace(/^[↑↓]\s*/, "");
  const vsIndex = rest.indexOf(" vs ");

  if (vsIndex === -1) {
    return {
      direction,
      percent: rest,
      comparisonLabel: "",
      sentiment: direction === "down" ? "negative" : "positive",
    };
  }

  return {
    direction,
    percent: rest.slice(0, vsIndex).trim(),
    comparisonLabel: rest.slice(vsIndex + 1).trim(),
    sentiment: direction === "down" ? "negative" : "positive",
  };
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatPercentValue(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
}

export function computeRowChange(
  thisMonth: number | null,
  lastMonth: number | null,
): {
  dollar: number | null;
  percent: number | null;
  dollarFormatted: string;
  percentFormatted: string;
  changePositive: boolean | null;
} {
  if (thisMonth === null || lastMonth === null) {
    return {
      dollar: null,
      percent: null,
      dollarFormatted: "-",
      percentFormatted: "-",
      changePositive: null,
    };
  }

  const dollar = thisMonth - lastMonth;
  const percent =
    lastMonth === 0 ? (thisMonth === 0 ? 0 : 100) : (dollar / Math.abs(lastMonth)) * 100;
  const changePositive = dollar > 0 ? true : dollar < 0 ? false : null;

  const dollarPrefix = dollar > 0 ? "+" : dollar < 0 ? "-" : "";
  const percentPrefix = percent > 0 ? "+" : percent < 0 ? "-" : "";

  return {
    dollar,
    percent,
    dollarFormatted: `${dollarPrefix}${formatCurrency(Math.abs(dollar))}`,
    percentFormatted: `${percentPrefix}${Math.abs(percent).toFixed(1)}%`,
    changePositive,
  };
}

export function buildDealerProfitLossKpiCards(
  kpis: DealerPlKpiStats,
): DealerPlKpiCard[] {
  return [
    {
      icon: "dollar-sign",
      color: "blue",
      label: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      delta: kpis.totalRevenueDelta,
      trend: {
        ...parseDealerPlDelta(kpis.totalRevenueDelta),
        sentiment: "positive",
      },
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints:
        "0,38 25,34 50,30 75,26 100,22 125,18 150,14 175,10 200,8 220,6",
      deltaColor: "green",
    },
    {
      icon: "bar-chart-3",
      color: "green",
      label: "Gross Profit",
      value: formatCurrency(kpis.grossProfit),
      delta: kpis.grossProfitDelta,
      trend: {
        ...parseDealerPlDelta(kpis.grossProfitDelta),
        sentiment: "positive",
      },
      link: "",
      sparkColor: "#10b981",
      sparkPoints:
        "0,40 25,36 50,32 75,28 100,24 125,20 150,16 175,12 200,10 220,8",
      deltaColor: "green",
    },
    {
      icon: "shopping-cart",
      color: "orange",
      label: "Total Expenses",
      value: formatCurrency(kpis.totalExpenses),
      delta: kpis.totalExpensesDelta,
      trend: {
        ...parseDealerPlDelta(kpis.totalExpensesDelta),
        sentiment: "negative",
      },
      link: "",
      sparkColor: "#f97316",
      sparkPoints:
        "0,36 25,34 50,32 75,30 100,28 125,26 150,24 175,22 200,20 220,18",
      deltaColor: "red",
    },
    {
      icon: "trending-up",
      color: "violet",
      label: "Net Profit",
      value: formatCurrency(kpis.netProfit),
      delta: kpis.netProfitDelta,
      trend: {
        ...parseDealerPlDelta(kpis.netProfitDelta),
        sentiment: "positive",
      },
      link: "",
      sparkColor: "#a855f7",
      sparkPoints:
        "0,42 25,38 50,34 75,28 100,24 125,18 150,14 175,10 200,8 220,6",
      deltaColor: "green",
    },
    {
      icon: "percent",
      color: "teal",
      label: "Gross Margin",
      value: formatPercentValue(kpis.grossMargin),
      delta: kpis.grossMarginDelta,
      trend: {
        ...parseDealerPlDelta(kpis.grossMarginDelta),
        sentiment: "positive",
      },
      link: "",
      sparkColor: "#14b8a6",
      sparkPoints:
        "0,38 25,36 50,34 75,32 100,28 125,24 150,20 175,16 200,12 220,10",
      deltaColor: "green",
    },
  ];
}
