import type {
  CategoryAmount,
  PlInsight,
  PlKpiMetric,
  PlTableRow,
  PlTrendPoint,
  ProfitLossReport,
} from "./types";
import { formatCurrency, formatPercent } from "./types";

function buildStatementRows(
  thisMonth: Record<string, number>,
  lastMonth: Record<string, number>,
): PlTableRow[] {
  const row = (
    id: string,
    kind: PlTableRow["kind"],
    label: string,
    section: PlTableRow["section"],
    key: string,
    showInfo = true,
  ): PlTableRow => ({
    id,
    kind,
    section,
    label,
    thisMonth: thisMonth[key] ?? null,
    lastMonth: lastMonth[key] ?? null,
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

function buildKpis(
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
    prevVal === 0 ? 0 : ((cur - prevVal) / Math.abs(prevVal)) * 100;

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
      delta: `+${revPct.toFixed(1)}%`,
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
      delta: `+${cogsPct.toFixed(1)}%`,
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
      delta: `+${gpPct.toFixed(1)}%`,
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
      delta: `+${expPct.toFixed(1)}%`,
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
      delta: `+${npPct.toFixed(1)}%`,
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
      delta: `+${marginDelta.toFixed(1)} pts`,
      deltaDirection: marginDelta >= 0 ? "up" : "down",
      deltaSentiment: "positive",
      comparisonLabel,
      iconColor: "teal",
    },
  ];
}

function buildDailyTrend(baseNetProfit: number): PlTrendPoint[] {
  const days = [1, 6, 11, 16, 21, 26, 31];
  const values = [-2000, 4200, 9800, 15400, 20100, 24800, baseNetProfit];
  return days.map((day, i) => ({
    date: `2025-05-${String(day).padStart(2, "0")}`,
    label: `May ${day}`,
    netProfit: values[i] ?? baseNetProfit,
  }));
}

function buildAprilDailyTrend(baseNetProfit: number): PlTrendPoint[] {
  const days = [1, 6, 11, 16, 21, 26, 30];
  const values = [-1500, 3100, 7200, 11800, 15200, 18400, baseNetProfit];
  return days.map((day, i) => ({
    date: `2025-04-${String(day).padStart(2, "0")}`,
    label: `Apr ${day}`,
    netProfit: values[i] ?? baseNetProfit,
  }));
}

const MAY_THIS: Record<string, number> = {
  vehicle_sales: 181120,
  other_income: 4110,
  total_revenue: 185230,
  vehicle_purchases: 106500,
  auction_fees: 4200,
  transportation: 2980,
  reconditioning: 3640,
  parts_supplies: 1730,
  total_cogs: 119050,
  gross_profit: 66180,
  payroll: 12940,
  rent: 5200,
  advertising: 4260,
  utilities: 1120,
  software: 1980,
  insurance: 2560,
  office: 1430,
  other_expenses: 8600,
  total_expenses: 38090,
  net_operating_income: 28090,
  sales_tax_collected: 14880,
  tax_expense: 0,
  net_profit: 28090,
};

const MAY_LAST: Record<string, number> = {
  vehicle_sales: 160250,
  other_income: 3270,
  total_revenue: 163520,
  vehicle_purchases: 95800,
  auction_fees: 3800,
  transportation: 2500,
  reconditioning: 3290,
  parts_supplies: 1500,
  total_cogs: 106890,
  gross_profit: 56630,
  payroll: 12320,
  rent: 5200,
  advertising: 3780,
  utilities: 980,
  software: 1840,
  insurance: 2550,
  office: 1390,
  other_expenses: 7780,
  total_expenses: 35840,
  net_operating_income: 20790,
  sales_tax_collected: 13210,
  tax_expense: 0,
  net_profit: 20790,
};

const APR_THIS: Record<string, number> = { ...MAY_LAST };
const APR_LAST: Record<string, number> = {
  vehicle_sales: 148900,
  other_income: 2890,
  total_revenue: 151790,
  vehicle_purchases: 89200,
  auction_fees: 3500,
  transportation: 2280,
  reconditioning: 3010,
  parts_supplies: 1380,
  total_cogs: 99370,
  gross_profit: 52420,
  payroll: 11850,
  rent: 5200,
  advertising: 3520,
  utilities: 920,
  software: 1720,
  insurance: 2550,
  office: 1320,
  other_expenses: 7120,
  total_expenses: 33200,
  net_operating_income: 19220,
  sales_tax_collected: 12180,
  tax_expense: 0,
  net_profit: 19220,
};

const MAR_THIS: Record<string, number> = { ...APR_LAST };
const MAR_LAST: Record<string, number> = {
  vehicle_sales: 139400,
  other_income: 2650,
  total_revenue: 142050,
  vehicle_purchases: 84100,
  auction_fees: 3200,
  transportation: 2100,
  reconditioning: 2780,
  parts_supplies: 1290,
  total_cogs: 93470,
  gross_profit: 48580,
  payroll: 11200,
  rent: 5200,
  advertising: 3280,
  utilities: 880,
  software: 1650,
  insurance: 2500,
  office: 1280,
  other_expenses: 6680,
  total_expenses: 31670,
  net_operating_income: 16910,
  sales_tax_collected: 11420,
  tax_expense: 0,
  net_profit: 16910,
};

function buildRevenueBreakdown(data: Record<string, number>): CategoryAmount[] {
  const total = data.total_revenue;
  return [
    {
      id: "vehicle_sales",
      label: "Vehicle Sales",
      amount: data.vehicle_sales,
      lastMonth: 0,
      percentOfTotal: (data.vehicle_sales / total) * 100,
    },
    {
      id: "other_income",
      label: "Other Income",
      amount: data.other_income,
      lastMonth: 0,
      percentOfTotal: (data.other_income / total) * 100,
    },
  ];
}

function buildExpenseBreakdown(data: Record<string, number>): CategoryAmount[] {
  const total = data.total_expenses;
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
    amount: data[key],
    lastMonth: 0,
    percentOfTotal: (data[key] / total) * 100,
  }));
}

function buildInsights(
  thisMonth: Record<string, number>,
  lastMonth: Record<string, number>,
  periodLabel: string,
): PlInsight[] {
  const npDelta = thisMonth.net_profit - lastMonth.net_profit;
  const npPct =
    lastMonth.net_profit === 0
      ? 0
      : (npDelta / lastMonth.net_profit) * 100;
  const vsDelta = thisMonth.vehicle_sales - lastMonth.vehicle_sales;
  const vsPct =
    lastMonth.vehicle_sales === 0
      ? 0
      : (vsDelta / lastMonth.vehicle_sales) * 100;
  const expDelta = thisMonth.total_expenses - lastMonth.total_expenses;
  const expPct =
    lastMonth.total_expenses === 0
      ? 0
      : (expDelta / lastMonth.total_expenses) * 100;
  const gpMargin = (thisMonth.gross_profit / thisMonth.total_revenue) * 100;
  const prevGpMargin = (lastMonth.gross_profit / lastMonth.total_revenue) * 100;

  return [
    {
      id: "net-profit",
      text: `Net profit for ${periodLabel} is ${formatCurrency(thisMonth.net_profit)}, an increase of ${formatCurrency(npDelta)} (${npPct.toFixed(1)}%) compared to last month.`,
      icon: "check",
    },
    {
      id: "vehicle-sales",
      text: `Vehicle sales revenue increased by ${formatCurrency(vsDelta)} (${vsPct.toFixed(1)}%) driven by higher unit volume and average selling price.`,
      icon: "car",
    },
    {
      id: "operating-expenses",
      text: `Operating expenses rose by ${formatCurrency(expDelta)} (${expPct.toFixed(1)}%), primarily from advertising and payroll & commissions.`,
      icon: "package",
    },
    {
      id: "gross-margin",
      text: `Gross profit margin improved to ${gpMargin.toFixed(1)}%, up ${(gpMargin - prevGpMargin).toFixed(1)} points from the prior period.`,
      icon: "bag",
    },
  ];
}

function buildReport(
  id: PlDateRangeKey,
  thisMonth: Record<string, number>,
  lastMonth: Record<string, number>,
  period: ProfitLossReport["period"],
  comparisonPeriod: ProfitLossReport["comparisonPeriod"],
  soldVehicleCount: number,
  trendBuilder: (np: number) => PlTrendPoint[],
): ProfitLossReport {
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

  const revenueBreakdown = buildRevenueBreakdown(thisMonth).map((item) => ({
    ...item,
    lastMonth:
      item.id === "vehicle_sales"
        ? lastMonth.vehicle_sales
        : lastMonth.other_income,
  }));

  const expenseBreakdown = buildExpenseBreakdown(thisMonth).map((item) => ({
    ...item,
    lastMonth: lastMonth[item.id] ?? 0,
  }));

  return {
    meta: {
      generatedAt: "2025-05-31T11:45:00",
      generatedBy: "AutoVault System",
      currency: "USD",
      basis: "cash",
      dataSource: "Sales, Expenses, Payroll",
      reportType: "Profit & Loss Statement",
    },
    period,
    comparisonPeriod,
    kpis: buildKpis(totals, prevTotals, comparisonPeriod.label),
    statementRows: buildStatementRows(thisMonth, lastMonth),
    dailyTrend: trendBuilder(thisMonth.net_profit),
    comparisonDailyTrend: [],
    revenueBreakdown,
    expenseBreakdown,
    insights: buildInsights(thisMonth, lastMonth, period.label.split(" ")[0] ?? "May"),
    soldVehicleCount,
  };
}

type PlDateRangeKey = "may_2025" | "apr_2025" | "mar_2025";

export const PL_REPORTS: Record<PlDateRangeKey, ProfitLossReport> = {
  may_2025: buildReport(
    "may_2025",
    MAY_THIS,
    MAY_LAST,
    {
      start: "2025-05-01",
      end: "2025-05-31",
      label: "May 1 - May 31, 2025",
      columnLabel: "May 1 - May 31, 2025",
    },
    {
      start: "2025-04-01",
      end: "2025-04-30",
      label: "vs Apr 1 - Apr 30, 2025",
      columnLabel: "Apr 1 - Apr 30, 2025",
    },
    23,
    buildDailyTrend,
  ),
  apr_2025: buildReport(
    "apr_2025",
    APR_THIS,
    APR_LAST,
    {
      start: "2025-04-01",
      end: "2025-04-30",
      label: "Apr 1 - Apr 30, 2025",
      columnLabel: "Apr 1 - Apr 30, 2025",
    },
    {
      start: "2025-03-01",
      end: "2025-03-31",
      label: "vs Mar 1 - Mar 31, 2025",
      columnLabel: "Mar 1 - Mar 31, 2025",
    },
    19,
    buildAprilDailyTrend,
  ),
  mar_2025: buildReport(
    "mar_2025",
    MAR_THIS,
    MAR_LAST,
    {
      start: "2025-03-01",
      end: "2025-03-31",
      label: "Mar 1 - Mar 31, 2025",
      columnLabel: "Mar 1 - Mar 31, 2025",
    },
    {
      start: "2025-02-01",
      end: "2025-02-28",
      label: "vs Feb 1 - Feb 28, 2025",
      columnLabel: "Feb 1 - Feb 28, 2025",
    },
    17,
    (np) =>
      [1, 8, 15, 22, 31].map((day, i) => ({
        date: `2025-03-${String(day).padStart(2, "0")}`,
        label: `Mar ${day}`,
        netProfit: [-800, 2400, 6800, 11200, np][i] ?? np,
      })),
  ),
};

export const PL_FILTER_OPTIONS = {
  salesReps: [
    { value: "all", label: "All" },
    { value: "john", label: "John Dealer" },
    { value: "sarah", label: "Sarah Williams" },
    { value: "mike", label: "Mike Thompson" },
  ],
  locations: [
    { value: "all", label: "All" },
    { value: "main", label: "Main Lot" },
    { value: "north", label: "North Branch" },
  ],
  dealTypes: [
    { value: "all", label: "All" },
    { value: "cash", label: "Cash" },
    { value: "finance", label: "Finance" },
    { value: "lease", label: "Lease" },
  ],
};

export const PROFIT_LOSS_MOCK = PL_REPORTS.may_2025;
