import type {
  CategoryAmount,
  PlInsight,
  PlKpiMetric,
  PlTableRow,
  PlTrendPoint,
  ProfitLossMeta,
  ProfitLossPeriod,
  ProfitLossReport,
} from "./types";
import { formatCurrency, formatPercent } from "./types";

export type PeriodTotals = {
  vehicle_sales: number;
  other_income: number;
  total_revenue: number;
  vehicle_purchases: number;
  auction_fees: number;
  transportation: number;
  reconditioning: number;
  parts_supplies: number;
  total_cogs: number;
  gross_profit: number;
  payroll: number;
  rent: number;
  advertising: number;
  utilities: number;
  software: number;
  insurance: number;
  office: number;
  other_expenses: number;
  total_expenses: number;
  net_operating_income: number;
  sales_tax_collected: number;
  tax_expense: number;
  net_profit: number;
};

export const EMPTY_PERIOD_TOTALS: PeriodTotals = {
  vehicle_sales: 0,
  other_income: 0,
  total_revenue: 0,
  vehicle_purchases: 0,
  auction_fees: 0,
  transportation: 0,
  reconditioning: 0,
  parts_supplies: 0,
  total_cogs: 0,
  gross_profit: 0,
  payroll: 0,
  rent: 0,
  advertising: 0,
  utilities: 0,
  software: 0,
  insurance: 0,
  office: 0,
  other_expenses: 0,
  total_expenses: 0,
  net_operating_income: 0,
  sales_tax_collected: 0,
  tax_expense: 0,
  net_profit: 0,
};

function formatDeltaPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDeltaPts(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} pts`;
}

export function buildStatementRows(
  thisMonth: PeriodTotals,
  lastMonth: PeriodTotals,
): PlTableRow[] {
  const row = (
    id: string,
    kind: PlTableRow["kind"],
    label: string,
    section: PlTableRow["section"],
    key: keyof PeriodTotals | "revenue_header" | "cogs_header" | "op_header" | "tax_header",
    showInfo = true,
  ): PlTableRow => ({
    id,
    kind,
    section,
    label,
    thisMonth:
      key in thisMonth ? thisMonth[key as keyof PeriodTotals] ?? null : null,
    lastMonth:
      key in lastMonth ? lastMonth[key as keyof PeriodTotals] ?? null : null,
    showInfo,
  });

  return [
    row("sec-revenue", "section-header", "REVENUE", "revenue", "revenue_header", false),
    row("vehicle-sales", "line-item", "Vehicle Sales", "revenue", "vehicle_sales"),
    row("other-income", "line-item", "Other Income", "revenue", "other_income"),
    row("total-revenue", "subtotal", "TOTAL REVENUE", "revenue", "total_revenue", false),

    row("sec-cogs", "section-header", "COST OF GOODS SOLD", "cogs", "cogs_header", false),
    row("vehicle-purchases", "line-item", "Vehicle Purchases", "cogs", "vehicle_purchases"),
    row("auction-fees", "line-item", "Auction Fees", "cogs", "auction_fees"),
    row("transportation", "line-item", "Transportation", "cogs", "transportation"),
    row("reconditioning", "line-item", "Reconditioning", "cogs", "reconditioning"),
    row("parts-supplies", "line-item", "Parts & Supplies", "cogs", "parts_supplies"),
    row("total-cogs", "subtotal", "TOTAL COST OF GOODS SOLD", "cogs", "total_cogs", false),

    row("gross-profit", "subtotal", "GROSS PROFIT", "gross_profit", "gross_profit", false),

    row("sec-op-exp", "section-header", "OPERATING EXPENSES", "operating_expenses", "op_header", false),
    row("payroll", "line-item", "Payroll & Commissions", "operating_expenses", "payroll"),
    row("rent", "line-item", "Rent & Lease", "operating_expenses", "rent"),
    row("advertising", "line-item", "Advertising", "operating_expenses", "advertising"),
    row("utilities", "line-item", "Utilities", "operating_expenses", "utilities"),
    row("software", "line-item", "Software & Subscriptions", "operating_expenses", "software"),
    row("insurance", "line-item", "Insurance", "operating_expenses", "insurance"),
    row("office", "line-item", "Office & Admin", "operating_expenses", "office"),
    row("other-expenses", "line-item", "Other Expenses", "operating_expenses", "other_expenses"),
    row("total-op-exp", "subtotal", "TOTAL OPERATING EXPENSES", "operating_expenses", "total_expenses", false),

    row("net-op-income", "subtotal", "NET OPERATING INCOME", "net_operating_income", "net_operating_income", false),

    row("sec-taxes", "section-header", "TAXES / CDTFA", "taxes", "tax_header", false),
    row("sales-tax", "line-item", "Sales Tax Collected", "taxes", "sales_tax_collected"),
    row("tax-expense", "line-item", "Tax Expense", "taxes", "tax_expense"),
    row("net-profit", "total", "NET PROFIT", "net_profit", "net_profit", false),
  ];
}

export function buildKpis(
  totals: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  },
  prev: typeof totals,
  comparisonLabel: string,
): PlKpiMetric[] {
  const margin = totals.totalRevenue
    ? (totals.netProfit / totals.totalRevenue) * 100
    : 0;
  const prevMargin = prev.totalRevenue
    ? (prev.netProfit / prev.totalRevenue) * 100
    : 0;
  const marginDelta = margin - prevMargin;

  const pct = (cur: number, prevVal: number) =>
    prevVal === 0 ? (cur === 0 ? 0 : 100) : ((cur - prevVal) / Math.abs(prevVal)) * 100;

  const revPct = pct(totals.totalRevenue, prev.totalRevenue);
  const cogsPct = pct(totals.totalCogs, prev.totalCogs);
  const gpPct = pct(totals.grossProfit, prev.grossProfit);
  const expPct = pct(totals.totalExpenses, prev.totalExpenses);
  const npPct = pct(totals.netProfit, prev.netProfit);

  return [
    {
      id: "total_revenue",
      label: "Total Revenue",
      value: totals.totalRevenue,
      valueFormatted: formatCurrency(totals.totalRevenue),
      delta: formatDeltaPct(revPct),
      deltaDirection: revPct >= 0 ? "up" : "down",
      deltaSentiment: "positive",
      comparisonLabel,
      iconColor: "green",
    },
    {
      id: "total_cogs",
      label: "Total Cost of Goods Sold",
      value: totals.totalCogs,
      valueFormatted: formatCurrency(totals.totalCogs),
      delta: formatDeltaPct(cogsPct),
      deltaDirection: cogsPct >= 0 ? "up" : "down",
      deltaSentiment: "negative",
      comparisonLabel,
      iconColor: "red",
    },
    {
      id: "gross_profit",
      label: "Gross Profit",
      value: totals.grossProfit,
      valueFormatted: formatCurrency(totals.grossProfit),
      delta: formatDeltaPct(gpPct),
      deltaDirection: gpPct >= 0 ? "up" : "down",
      deltaSentiment: "positive",
      comparisonLabel,
      iconColor: "purple",
    },
    {
      id: "total_expenses",
      label: "Total Expenses",
      value: totals.totalExpenses,
      valueFormatted: formatCurrency(totals.totalExpenses),
      delta: formatDeltaPct(expPct),
      deltaDirection: expPct >= 0 ? "up" : "down",
      deltaSentiment: "negative",
      comparisonLabel,
      iconColor: "orange",
    },
    {
      id: "net_profit",
      label: "Net Profit",
      value: totals.netProfit,
      valueFormatted: formatCurrency(totals.netProfit),
      delta: formatDeltaPct(npPct),
      deltaDirection: npPct >= 0 ? "up" : "down",
      deltaSentiment: "positive",
      comparisonLabel,
      iconColor: "blue",
    },
    {
      id: "net_profit_margin",
      label: "Net Profit Margin",
      value: margin,
      valueFormatted: formatPercent(margin),
      delta: formatDeltaPts(marginDelta),
      deltaDirection: marginDelta >= 0 ? "up" : "down",
      deltaSentiment: "positive",
      comparisonLabel,
      iconColor: "teal",
    },
  ];
}

export function buildRevenueBreakdown(
  data: PeriodTotals,
  lastMonth?: PeriodTotals,
): CategoryAmount[] {
  const total = data.total_revenue || 1;
  return [
    {
      id: "vehicle_sales",
      label: "Vehicle Sales",
      amount: data.vehicle_sales,
      lastMonth: lastMonth?.vehicle_sales ?? 0,
      percentOfTotal: (data.vehicle_sales / total) * 100,
    },
    {
      id: "other_income",
      label: "Other Income",
      amount: data.other_income,
      lastMonth: lastMonth?.other_income ?? 0,
      percentOfTotal: (data.other_income / total) * 100,
    },
  ];
}

export function buildExpenseBreakdown(
  data: PeriodTotals,
  lastMonth?: PeriodTotals,
): CategoryAmount[] {
  const total = data.total_expenses || 1;
  const items = [
    { id: "payroll", label: "Payroll & Commissions", key: "payroll" },
    { id: "rent", label: "Rent & Lease", key: "rent" },
    { id: "advertising", label: "Advertising", key: "advertising" },
    { id: "utilities", label: "Utilities", key: "utilities" },
    { id: "software", label: "Software & Subscriptions", key: "software" },
    { id: "insurance", label: "Insurance", key: "insurance" },
    { id: "office", label: "Office & Admin", key: "office" },
    { id: "other_expenses", label: "Other Expenses", key: "other_expenses" },
  ];
  return items.map(({ id, label, key }) => ({
    id,
    label,
    amount: data[key as keyof PeriodTotals] ?? 0,
    lastMonth: lastMonth?.[key as keyof PeriodTotals] ?? 0,
    percentOfTotal: ((data[key as keyof PeriodTotals] ?? 0) / total) * 100,
  }));
}

export function buildInsights(
  thisMonth: PeriodTotals,
  lastMonth: PeriodTotals,
  periodLabel: string,
): PlInsight[] {
  const npDelta = thisMonth.net_profit - lastMonth.net_profit;
  const npPct =
    lastMonth.net_profit === 0
      ? thisMonth.net_profit === 0
        ? 0
        : 100
      : (npDelta / lastMonth.net_profit) * 100;
  const vsDelta = thisMonth.vehicle_sales - lastMonth.vehicle_sales;
  const vsPct =
    lastMonth.vehicle_sales === 0
      ? thisMonth.vehicle_sales === 0
        ? 0
        : 100
      : (vsDelta / lastMonth.vehicle_sales) * 100;
  const expDelta = thisMonth.total_expenses - lastMonth.total_expenses;
  const expPct =
    lastMonth.total_expenses === 0
      ? thisMonth.total_expenses === 0
        ? 0
        : 100
      : (expDelta / lastMonth.total_expenses) * 100;
  const gpMargin = thisMonth.total_revenue
    ? (thisMonth.gross_profit / thisMonth.total_revenue) * 100
    : 0;
  const prevGpMargin = lastMonth.total_revenue
    ? (lastMonth.gross_profit / lastMonth.total_revenue) * 100
    : 0;

  const npDirection = npDelta >= 0 ? "increase" : "decrease";
  const vsDirection = vsDelta >= 0 ? "increased" : "decreased";
  const expDirection = expDelta >= 0 ? "rose" : "fell";
  const marginDirection = gpMargin >= prevGpMargin ? "improved" : "declined";

  return [
    {
      id: "net-profit",
      text: `Net profit for ${periodLabel} is ${formatCurrency(thisMonth.net_profit)}, an ${npDirection} of ${formatCurrency(Math.abs(npDelta))} (${Math.abs(npPct).toFixed(1)}%) compared to the prior period.`,
      icon: "check",
    },
    {
      id: "vehicle-sales",
      text: `Vehicle sales revenue ${vsDirection} by ${formatCurrency(Math.abs(vsDelta))} (${Math.abs(vsPct).toFixed(1)}%) compared to the prior period.`,
      icon: "car",
    },
    {
      id: "operating-expenses",
      text: `Operating expenses ${expDirection} by ${formatCurrency(Math.abs(expDelta))} (${Math.abs(expPct).toFixed(1)}%) compared to the prior period.`,
      icon: "package",
    },
    {
      id: "gross-margin",
      text: `Gross profit margin ${marginDirection} to ${gpMargin.toFixed(1)}%, ${gpMargin >= prevGpMargin ? "up" : "down"} ${Math.abs(gpMargin - prevGpMargin).toFixed(1)} points from the prior period.`,
      icon: "bag",
    },
  ];
}

export function buildDailyTrendFromEvents(
  periodStart: string,
  periodEnd: string,
  dailyNetByDate: Map<string, number>,
): PlTrendPoint[] {
  const start = new Date(`${periodStart}T12:00:00`);
  const end = new Date(`${periodEnd}T12:00:00`);
  const points: PlTrendPoint[] = [];
  let cumulative = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    cumulative += dailyNetByDate.get(iso) ?? 0;
    const label = cursor.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    points.push({ date: iso, label, netProfit: roundMoney(cumulative) });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (points.length === 0) {
    return [{ date: periodStart, label: periodStart, netProfit: 0 }];
  }

  const step = Math.max(1, Math.floor(points.length / 7));
  return points.filter((_, i) => i % step === 0 || i === points.length - 1);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildProfitLossReport(params: {
  thisMonth: PeriodTotals;
  lastMonth: PeriodTotals;
  period: ProfitLossPeriod;
  comparisonPeriod: ProfitLossPeriod;
  dailyTrend: PlTrendPoint[];
  soldVehicleCount: number;
  meta?: Partial<ProfitLossMeta>;
  comparisonDailyTrend?: PlTrendPoint[];
}): ProfitLossReport {
  const { thisMonth, lastMonth, period, comparisonPeriod, dailyTrend, soldVehicleCount } =
    params;

  const totals = {
    totalRevenue: thisMonth.total_revenue,
    totalCogs: thisMonth.total_cogs,
    grossProfit: thisMonth.gross_profit,
    totalExpenses: thisMonth.total_expenses,
    netProfit: thisMonth.net_profit,
  };
  const prevTotals = {
    totalRevenue: lastMonth.total_revenue,
    totalCogs: lastMonth.total_cogs,
    grossProfit: lastMonth.gross_profit,
    totalExpenses: lastMonth.total_expenses,
    netProfit: lastMonth.net_profit,
  };

  const periodShort =
    new Date(`${period.start}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
    }) ?? "Period";

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      generatedBy: "AutoVault System",
      currency: "USD",
      basis: "accrual",
      dataSource: "Deal Jackets, Expenses, Vehicle Costs",
      reportType: "Profit & Loss Statement",
      ...params.meta,
    },
    period,
    comparisonPeriod,
    kpis: buildKpis(totals, prevTotals, comparisonPeriod.label),
    statementRows: buildStatementRows(thisMonth, lastMonth),
    dailyTrend,
    revenueBreakdown: buildRevenueBreakdown(thisMonth, lastMonth),
    expenseBreakdown: buildExpenseBreakdown(thisMonth, lastMonth),
    insights: buildInsights(thisMonth, lastMonth, periodShort),
    soldVehicleCount,
    comparisonDailyTrend: params.comparisonDailyTrend ?? [],
  };
}

export function finalizePeriodTotals(raw: Partial<PeriodTotals>): PeriodTotals {
  const t: PeriodTotals = { ...EMPTY_PERIOD_TOTALS, ...raw };

  t.total_revenue = t.vehicle_sales + t.other_income;
  t.total_cogs =
    t.vehicle_purchases +
    t.auction_fees +
    t.transportation +
    t.reconditioning +
    t.parts_supplies;
  t.gross_profit = t.total_revenue - t.total_cogs;
  t.total_expenses =
    t.payroll +
    t.rent +
    t.advertising +
    t.utilities +
    t.software +
    t.insurance +
    t.office +
    t.other_expenses;
  t.net_operating_income = t.gross_profit - t.total_expenses;
  t.net_profit = t.net_operating_income - t.tax_expense;

  return t;
}
