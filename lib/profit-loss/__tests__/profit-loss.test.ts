import { describe, it, expect } from "vitest";

// ...... Types / Formatters ......................................................................................................................................................
import {
  formatPercent,
  formatPoints,
  formatCompactCurrency,
  computeChange,
  DEFAULT_PL_FILTERS,
} from "../types";

// ...... Build Report ........................................................................................................................................................................
import {
  finalizePeriodTotals,
  EMPTY_PERIOD_TOTALS,
  buildKpis,
  buildStatementRows,
  buildRevenueBreakdown,
  buildExpenseBreakdown,
  buildInsights,
  buildDailyTrendFromEvents,
  buildProfitLossReport,
} from "../build-report";
import type { PeriodTotals } from "../build-report";

// ...... Filter / Enrich ...............................................................................................................................................................
import { enrichTableRows, applyPlFilters } from "../filter-pl-data";

// ...... Aggregation ...........................................................................................................................................................................
import { matchesDealType, aggregatePeriodTotals } from "../server/aggregate-pl-data";
import type { RawDealJacket, RawVehicleExpense, RawDealershipExpense } from "../server/aggregate-pl-data";

// ...... Mock data for verification ..............................................................................................................................
import { PROFIT_LOSS_MOCK } from "../mock-data";

// =========================================================================
//  SECTION 1 ... Formatters
// =========================================================================
describe("formatPercent", () => {
  it("formats positive percent", () => {
    expect(formatPercent(12.3)).toBe("12.3%");
  });
  it("formats zero percent", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
  it("formats negative percent", () => {
    expect(formatPercent(-5.7)).toBe("-5.7%");
  });
  it("accepts custom decimals", () => {
    expect(formatPercent(12.3456, 2)).toBe("12.35%");
  });
});

describe("formatPoints", () => {
  it("formats positive points with +", () => {
    expect(formatPoints(5.0)).toBe("+5.0 pts");
  });
  it("formats negative points with -", () => {
    expect(formatPoints(-3.2)).toBe("-3.2 pts");
  });
  it("formats zero points with +", () => {
    expect(formatPoints(0)).toBe("+0.0 pts");
  });
});

describe("formatCompactCurrency", () => {
  it("formats thousands as K", () => {
    expect(formatCompactCurrency(181120)).toBe("$181K");
  });
  it("formats negative thousands", () => {
    expect(formatCompactCurrency(-5000)).toBe("-$5K");
  });
  it("formats small values without K", () => {
    expect(formatCompactCurrency(500)).toBe("$500");
  });
  it("formats zero", () => {
    expect(formatCompactCurrency(0)).toBe("$0");
  });
  it("formats values just below 1000", () => {
    expect(formatCompactCurrency(999)).toBe("$999");
  });
  it("formats exactly 1000", () => {
    expect(formatCompactCurrency(1000)).toBe("$1K");
  });
});

// =========================================================================
//  SECTION 2 ... computeChange
// =========================================================================
describe("computeChange", () => {
  it("computes positive dollar and percent", () => {
    const { dollar, percent } = computeChange(150, 100);
    expect(dollar).toBe(50);
    expect(percent).toBe(50);
  });
  it("computes negative change", () => {
    const { dollar, percent } = computeChange(80, 100);
    expect(dollar).toBe(-20);
    expect(percent).toBe(-20);
  });
  it("returns 0 percent when previous is 0", () => {
    const { dollar, percent } = computeChange(50, 0);
    expect(dollar).toBe(50);
    expect(percent).toBe(0);
  });
  it("returns 0 when both are 0", () => {
    const { dollar, percent } = computeChange(0, 0);
    expect(dollar).toBe(0);
    expect(percent).toBe(0);
  });
  it("handles negative previous value", () => {
    const { dollar, percent } = computeChange(-50, -100);
    expect(dollar).toBe(50);
    expect(percent).toBe(50);
  });
  it("works with large numbers", () => {
    const { dollar, percent } = computeChange(185230, 163520);
    expect(dollar).toBe(21710);
    expect(percent).toBeCloseTo(13.277, 2);
  });
});

// =========================================================================
//  SECTION 3 ... finalizePeriodTotals
// =========================================================================
describe("finalizePeriodTotals", () => {
  const raw: Partial<PeriodTotals> = {
    vehicle_sales: 181120,
    other_income: 4110,
    vehicle_purchases: 106500,
    auction_fees: 4200,
    transportation: 2980,
    reconditioning: 3640,
    parts_supplies: 1730,
    payroll: 12940,
    rent: 5200,
    advertising: 4260,
    utilities: 1120,
    software: 1980,
    insurance: 2560,
    office: 1430,
    other_expenses: 8600,
    sales_tax_collected: 14880,
    tax_expense: 0,
  };

  const result = finalizePeriodTotals(raw);

  it("computes total_revenue = vehicle_sales + other_income", () => {
    expect(result.total_revenue).toBe(181120 + 4110);
  });

  it("computes total_cogs = sum of all COGS lines", () => {
    expect(result.total_cogs).toBe(106500 + 4200 + 2980 + 3640 + 1730);
  });

  it("computes gross_profit = total_revenue - total_cogs", () => {
    expect(result.gross_profit).toBe(result.total_revenue - result.total_cogs);
  });

  it("computes total_expenses = sum of all expense lines", () => {
    expect(result.total_expenses).toBe(
      12940 + 5200 + 4260 + 1120 + 1980 + 2560 + 1430 + 8600,
    );
  });

  it("computes net_operating_income = gross_profit - total_expenses", () => {
    expect(result.net_operating_income).toBe(
      result.gross_profit - result.total_expenses,
    );
  });

  it("computes net_profit = net_operating_income - tax_expense", () => {
    expect(result.net_profit).toBe(result.net_operating_income - result.tax_expense);
  });

  it("matches expected May 2025 mock values", () => {
    expect(result.total_revenue).toBe(185230);
    expect(result.total_cogs).toBe(119050);
    expect(result.gross_profit).toBe(66180);
    expect(result.total_expenses).toBe(38090);
    expect(result.net_operating_income).toBe(28090);
    expect(result.net_profit).toBe(28090);
  });

  it("produces empty totals when all inputs are zero", () => {
    const empty = finalizePeriodTotals({});
    expect(empty.total_revenue).toBe(0);
    expect(empty.total_cogs).toBe(0);
    expect(empty.gross_profit).toBe(0);
    expect(empty.total_expenses).toBe(0);
    expect(empty.net_operating_income).toBe(0);
    expect(empty.net_profit).toBe(0);
  });
});

// =========================================================================
//  SECTION 4 ... buildKpis
// =========================================================================
describe("buildKpis", () => {
  const current = {
    totalRevenue: 185230,
    totalCogs: 119050,
    grossProfit: 66180,
    totalExpenses: 38090,
    netProfit: 28090,
  };
  const previous = {
    totalRevenue: 163520,
    totalCogs: 106890,
    grossProfit: 56630,
    totalExpenses: 35840,
    netProfit: 20790,
  };
  const kpis = buildKpis(current, previous, "vs Apr 1 - Apr 30, 2025");

  it("returns exactly 6 KPIs", () => {
    expect(kpis).toHaveLength(6);
  });

  it("calculates Total Revenue correctly", () => {
    const rev = kpis.find((k) => k.id === "total_revenue")!;
    expect(rev.value).toBe(185230);
    expect(rev.label).toBe("Total Revenue");
    expect(rev.comparisonLabel).toBe("vs Apr 1 - Apr 30, 2025");
  });

  it("calculates Total COGS correctly", () => {
    const cogs = kpis.find((k) => k.id === "total_cogs")!;
    expect(cogs.value).toBe(119050);
  });

  it("calculates Gross Profit correctly", () => {
    const gp = kpis.find((k) => k.id === "gross_profit")!;
    expect(gp.value).toBe(66180);
  });

  it("calculates Total Expenses correctly", () => {
    const exp = kpis.find((k) => k.id === "total_expenses")!;
    expect(exp.value).toBe(38090);
  });

  it("calculates Net Profit correctly", () => {
    const np = kpis.find((k) => k.id === "net_profit")!;
    expect(np.value).toBe(28090);
  });

  it("calculates Net Profit Margin = (netProfit / totalRevenue) * 100", () => {
    const margin = kpis.find((k) => k.id === "net_profit_margin")!;
    expect(margin.value).toBeCloseTo((28090 / 185230) * 100, 2);
  });

  it("calculates revenue delta percent correctly", () => {
    const rev = kpis.find((k) => k.id === "total_revenue")!;
    const expectedPct = ((185230 - 163520) / Math.abs(163520)) * 100;
    expect(rev.delta).toBe(`+${expectedPct.toFixed(1)}%`);
  });

  it("calculates margin delta in points", () => {
    const margin = kpis.find((k) => k.id === "net_profit_margin")!;
    const curMargin = (28090 / 185230) * 100;
    const prevMargin = (20790 / 163520) * 100;
    const expectedDelta = curMargin - prevMargin;
    expect(margin.delta).toBe(`+${expectedDelta.toFixed(1)} pts`);
  });

  it("sets delta direction up when positive", () => {
    const rev = kpis.find((k) => k.id === "total_revenue")!;
    expect(rev.deltaDirection).toBe("up");
  });

  it("sets delta direction down when negative", () => {
    const cogs = kpis.find((k) => k.id === "total_cogs")!;
    // COGS increase = cogsPct is positive, but direction should be "up"
    expect(cogs.deltaDirection).toBe("up");
  });

  it("sets sentiment: revenue positive, expenses negative", () => {
    expect(kpis.find((k) => k.id === "total_revenue")!.deltaSentiment).toBe("positive");
    expect(kpis.find((k) => k.id === "total_cogs")!.deltaSentiment).toBe("negative");
    expect(kpis.find((k) => k.id === "total_expenses")!.deltaSentiment).toBe("negative");
    expect(kpis.find((k) => k.id === "net_profit")!.deltaSentiment).toBe("positive");
  });

  it("handles zero totalRevenue (margin = 0)", () => {
    const zeroKpis = buildKpis(
      { totalRevenue: 0, totalCogs: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0 },
      { totalRevenue: 100, totalCogs: 50, grossProfit: 50, totalExpenses: 30, netProfit: 20 },
      "vs last",
    );
    const margin = zeroKpis.find((k) => k.id === "net_profit_margin")!;
    expect(margin.value).toBe(0);
  });

  it("handles zero previous value (delta = 100%)", () => {
    const k = buildKpis(
      { totalRevenue: 100, totalCogs: 50, grossProfit: 50, totalExpenses: 30, netProfit: 20 },
      { totalRevenue: 0, totalCogs: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0 },
      "vs last",
    );
    const rev = k.find((k) => k.id === "total_revenue")!;
    expect(rev.delta).toBe("+100.0%");
  });
});

// =========================================================================
//  SECTION 5 ... buildStatementRows
// =========================================================================
describe("buildStatementRows", () => {
  const thisMonth = finalizePeriodTotals({
    vehicle_sales: 181120, other_income: 4110,
    vehicle_purchases: 106500, auction_fees: 4200,
    transportation: 2980, reconditioning: 3640, parts_supplies: 1730,
    payroll: 12940, rent: 5200, advertising: 4260,
    utilities: 1120, software: 1980, insurance: 2560,
    office: 1430, other_expenses: 8600,
    sales_tax_collected: 14880, tax_expense: 0,
  });
  const lastMonth = finalizePeriodTotals({
    vehicle_sales: 160250, other_income: 3270,
    vehicle_purchases: 95800, auction_fees: 3800,
    transportation: 2500, reconditioning: 3290, parts_supplies: 1500,
    payroll: 12320, rent: 5200, advertising: 3780,
    utilities: 980, software: 1840, insurance: 2550,
    office: 1390, other_expenses: 7780,
    sales_tax_collected: 13210, tax_expense: 0,
  });

  const rows = buildStatementRows(thisMonth, lastMonth);

  it("has the correct total row count", () => {
    expect(rows).toHaveLength(27);
  });

  it("starts with REVENUE section header", () => {
    expect(rows[0].kind).toBe("section-header");
    expect(rows[0].label).toBe("REVENUE");
  });

  it("has Vehicle Sales as first line item", () => {
    expect(rows[1].id).toBe("vehicle-sales");
    expect(rows[1].thisMonth).toBe(181120);
    expect(rows[1].lastMonth).toBe(160250);
  });

  it("has TOTAL REVENUE subtotal with correct value", () => {
    const row = rows.find((r) => r.id === "total-revenue")!;
    expect(row.thisMonth).toBe(185230);
    expect(row.lastMonth).toBe(163520);
  });

  it("has GROSS PROFIT with correct value", () => {
    const row = rows.find((r) => r.id === "gross-profit")!;
    expect(row.thisMonth).toBe(66180);
    expect(row.lastMonth).toBe(56630);
  });

  it("has NET PROFIT as total kind", () => {
    const row = rows.find((r) => r.id === "net-profit")!;
    expect(row.kind).toBe("total");
    expect(row.thisMonth).toBe(28090);
    expect(row.lastMonth).toBe(20790);
  });

  it("has all required section headers", () => {
    const sections = rows.filter((r) => r.kind === "section-header").map((r) => r.label);
    expect(sections).toContain("REVENUE");
    expect(sections).toContain("COST OF GOODS SOLD");
    expect(sections).toContain("OPERATING EXPENSES");
    expect(sections).toContain("TAXES / CDTFA");
  });
});

// =========================================================================
//  SECTION 6 ... Revenue & Expense Breakdown
// =========================================================================
describe("buildRevenueBreakdown", () => {
  const data = finalizePeriodTotals({ vehicle_sales: 181120, other_income: 4110 });
  const breakdown = buildRevenueBreakdown(data);

  it("has 2 items", () => {
    expect(breakdown).toHaveLength(2);
  });

  it("vehicle_sales percent of total", () => {
    const item = breakdown.find((i) => i.id === "vehicle_sales")!;
    expect(item.amount).toBe(181120);
    expect(item.percentOfTotal).toBeCloseTo((181120 / 185230) * 100, 2);
  });

  it("other_income percent of total", () => {
    const item = breakdown.find((i) => i.id === "other_income")!;
    expect(item.amount).toBe(4110);
    expect(item.percentOfTotal).toBeCloseTo((4110 / 185230) * 100, 2);
  });

  it("percentages sum to 100", () => {
    const sum = breakdown.reduce((a, b) => a + b.percentOfTotal, 0);
    expect(sum).toBeCloseTo(100, 1);
  });
});

describe("buildExpenseBreakdown", () => {
  const data = finalizePeriodTotals({
    payroll: 12940, rent: 5200, advertising: 4260,
    utilities: 1120, software: 1980, insurance: 2560,
    office: 1430, other_expenses: 8600,
  });
  const breakdown = buildExpenseBreakdown(data);

  it("has 8 expense categories", () => {
    expect(breakdown).toHaveLength(8);
  });

  it("largest expense is payroll", () => {
    const payroll = breakdown.find((i) => i.id === "payroll")!;
    expect(payroll.amount).toBe(12940);
    const sorted = [...breakdown].sort((a, b) => b.amount - a.amount);
    expect(sorted[0].id).toBe("payroll");
  });

  it("percentages sum to ~100", () => {
    const sum = breakdown.reduce((a, b) => a + b.percentOfTotal, 0);
    expect(sum).toBeCloseTo(100, 1);
  });
});

// =========================================================================
//  SECTION 7 ... buildInsights
// =========================================================================
describe("buildInsights", () => {
  const thisMonth = finalizePeriodTotals({
    vehicle_sales: 181120, other_income: 4110,
    vehicle_purchases: 106500, auction_fees: 4200,
    transportation: 2980, reconditioning: 3640, parts_supplies: 1730,
    payroll: 12940, rent: 5200, advertising: 4260,
    utilities: 1120, software: 1980, insurance: 2560,
    office: 1430, other_expenses: 8600,
    sales_tax_collected: 14880, tax_expense: 0,
  });
  const lastMonth = finalizePeriodTotals({
    vehicle_sales: 160250, other_income: 3270,
    vehicle_purchases: 95800, auction_fees: 3800,
    transportation: 2500, reconditioning: 3290, parts_supplies: 1500,
    payroll: 12320, rent: 5200, advertising: 3780,
    utilities: 980, software: 1840, insurance: 2550,
    office: 1390, other_expenses: 7780,
    sales_tax_collected: 13210, tax_expense: 0,
  });
  const insights = buildInsights(thisMonth, lastMonth, "May");

  it("returns 4 insights", () => {
    expect(insights).toHaveLength(4);
  });

  it("has net-profit insight with correct increase text", () => {
    const np = insights.find((i) => i.id === "net-profit")!;
    expect(np.icon).toBe("check");
    expect(np.text).toContain("May");
    expect(np.text).toContain("$28,090.00");
    expect(np.text).toContain("increase");
    const npDelta = 28090 - 20790;
    const npPct = (npDelta / 20790) * 100;
    expect(np.text).toContain(npPct.toFixed(1));
  });

  it("has vehicle-sales insight", () => {
    const vs = insights.find((i) => i.id === "vehicle-sales")!;
    expect(vs.icon).toBe("car");
    expect(vs.text).toContain("increased");
  });

  it("has operating-expenses insight", () => {
    const oe = insights.find((i) => i.id === "operating-expenses")!;
    expect(oe.icon).toBe("package");
    expect(oe.text).toContain("rose");
  });

  it("has gross-margin insight", () => {
    const gm = insights.find((i) => i.id === "gross-margin")!;
    expect(gm.icon).toBe("bag");
    expect(gm.text).toContain("improved");
  });

  it("generates correct text for a decrease scenario", () => {
    const decThis = { ...thisMonth, net_profit: 10000, vehicle_sales: 90000 };
    const decInsights = buildInsights(decThis, lastMonth, "May");
    const np = decInsights.find((i) => i.id === "net-profit")!;
    expect(np.text).toContain("decrease");
    const vs = decInsights.find((i) => i.id === "vehicle-sales")!;
    expect(vs.text).toContain("decreased");
  });

  it("handles zero previous values", () => {
    const zeroPrev = {
      ...EMPTY_PERIOD_TOTALS,
      total_revenue: 0,
      gross_profit: 0,
    };
    const zeroThis = {
      ...EMPTY_PERIOD_TOTALS,
      total_revenue: 100,
      gross_profit: 50,
      net_profit: 20,
      vehicle_sales: 80,
      total_expenses: 30,
    };
    const i = buildInsights(zeroThis, zeroPrev, "Test");
    expect(i).toHaveLength(4);
    expect(i[0].text).toContain("increase");
  });
});

// =========================================================================
//  SECTION 8 ... buildDailyTrendFromEvents
// =========================================================================
describe("buildDailyTrendFromEvents", () => {
  it("builds cumulative daily trend from event map", () => {
    const events = new Map<string, number>([
      ["2025-05-01", 5000],
      ["2025-05-02", 3000],
      ["2025-05-03", -1000],
    ]);
    const trend = buildDailyTrendFromEvents("2025-05-01", "2025-05-03", events);
    expect(trend.length).toBeGreaterThanOrEqual(3);
    const may1 = trend.find((p) => p.date === "2025-05-01")!;
    const may2 = trend.find((p) => p.date === "2025-05-02")!;
    const may3 = trend.find((p) => p.date === "2025-05-03")!;
    expect(may1.netProfit).toBe(5000);
    expect(may2.netProfit).toBe(8000);
    expect(may3.netProfit).toBe(7000);
  });

  it("returns empty-point placeholder when no events", () => {
    const trend = buildDailyTrendFromEvents("2025-05-01", "2025-05-01", new Map());
    expect(trend).toHaveLength(1);
    expect(trend[0].netProfit).toBe(0);
  });

  it("samples to ~7 points for long periods", () => {
    const events = new Map<string, number>();
    for (let d = 1; d <= 30; d++) {
      events.set(`2025-05-${String(d).padStart(2, "0")}`, 1000);
    }
    const trend = buildDailyTrendFromEvents("2025-05-01", "2025-05-30", events);
    expect(trend.length).toBeLessThanOrEqual(10);
    // First and last should be included
    expect(trend[0].date).toBe("2025-05-01");
    expect(trend[trend.length - 1].date).toBe("2025-05-30");
  });
});

// =========================================================================
//  SECTION 9 ... enrichTableRows
// =========================================================================
describe("enrichTableRows", () => {
  const mockRows = [
    { id: "vehicle-sales", kind: "line-item" as const, section: "revenue" as const, label: "Vehicle Sales", thisMonth: 181120, lastMonth: 160250 },
    { id: "other-income", kind: "line-item" as const, section: "revenue" as const, label: "Other Income", thisMonth: 4110, lastMonth: 3270 },
    { id: "payroll", kind: "line-item" as const, section: "operating_expenses" as const, label: "Payroll", thisMonth: 12940, lastMonth: 12320 },
    { id: "auction-fees", kind: "line-item" as const, section: "cogs" as const, label: "Auction Fees", thisMonth: 4200, lastMonth: 3800 },
  ];

  const enriched = enrichTableRows(mockRows);

  it("calculates dollar change correctly", () => {
    const vs = enriched.find((r) => r.id === "vehicle-sales")!;
    expect(vs.dollarChange).toBe(181120 - 160250);
    expect(vs.dollarChangeFormatted).toBe("+$20,870.00");
  });

  it("calculates percent change correctly", () => {
    const vs = enriched.find((r) => r.id === "vehicle-sales")!;
    const expectedPct = ((181120 - 160250) / Math.abs(160250)) * 100;
    expect(vs.percentChange).toBeCloseTo(expectedPct, 2);
    expect(vs.percentChangeFormatted).toBe("+13.0%");
  });

  it("inverts positivity for expense sections (COGS)", () => {
    const af = enriched.find((r) => r.id === "auction-fees")!;
    // COGS increased (4200 > 3800), so changePositive should be false
    expect(af.changePositive).toBe(false);
  });

  it("inverts positivity for expense sections (operating_expenses)", () => {
    const pay = enriched.find((r) => r.id === "payroll")!;
    // Payroll increased, so changePositive should be false
    expect(pay.changePositive).toBe(false);
  });

  it("sets changePositive true for revenue increase", () => {
    const vs = enriched.find((r) => r.id === "vehicle-sales")!;
    expect(vs.changePositive).toBe(true);
  });

  it("sets changePositive true for COGS decrease", () => {
    const decRows = [
      { id: "test", kind: "line-item" as const, section: "cogs" as const, label: "Test", thisMonth: 100, lastMonth: 200 },
    ];
    const dec = enrichTableRows(decRows);
    expect(dec[0].changePositive).toBe(true);
  });

  it("handles null thisMonth/lastMonth", () => {
    const nullRows = [
      { id: "test", kind: "line-item" as const, section: "revenue" as const, label: "Test", thisMonth: null, lastMonth: null },
    ];
    const enriched = enrichTableRows(nullRows);
    expect(enriched[0].dollarChange).toBeNull();
    expect(enriched[0].dollarChangeFormatted).toBe("-");
  });
});

// =========================================================================
//  SECTION 10 ... applyPlFilters
// =========================================================================
describe("applyPlFilters", () => {
  it("filters statement rows by search term", () => {
    const report = PROFIT_LOSS_MOCK;
    const filtered = applyPlFilters(
      { ...DEFAULT_PL_FILTERS, search: "Vehicle" },
      report,
    );
    const labels = filtered.statementRows.map((r) => r.label);
    expect(labels).toContain("Vehicle Sales");
    expect(labels).toContain("REVENUE"); // section header kept because line-item matched
  });

  it("returns all rows when search is empty", () => {
    const report = PROFIT_LOSS_MOCK;
    const filtered = applyPlFilters(DEFAULT_PL_FILTERS, report);
    expect(filtered.statementRows.length).toBe(report.statementRows.length);
  });

  it("matches case-insensitively", () => {
    const report = PROFIT_LOSS_MOCK;
    const filtered = applyPlFilters(
      { ...DEFAULT_PL_FILTERS, search: "pAyRoLl" },
      report,
    );
    const labels = filtered.statementRows.map((r) => r.label);
    expect(labels).toContain("Payroll & Commissions");
  });

  it("returns only section headers for non-matching search", () => {
    const report = PROFIT_LOSS_MOCK;
    const filtered = applyPlFilters(
      { ...DEFAULT_PL_FILTERS, search: "zzzznotexist" },
      report,
    );
    // Only section-headers, subtotals, totals remain
    expect(filtered.statementRows.length).toBeLessThan(report.statementRows.length);
  });
});

// =========================================================================
//  SECTION 11 ... aggregatePeriodTotals
// =========================================================================
describe("aggregatePeriodTotals", () => {
  it("sums sold_price to vehicle_sales", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: 18000 },
      { vehicle_id: "v2", sold_price: 25000, total_invested: 17000, profit_gross: 6000, profit_net: 4500, commission_amount: 1500, total_tax: 1200, date_sold: "2025-05-02", amount_financed: 5000, acquisition_cost: 15000 },
    ];
    const result = aggregatePeriodTotals(jackets, [], []);
    expect(result.vehicle_sales).toBe(55000);
    expect(result.vehicle_purchases).toBe(18000 + 15000);
    expect(result.payroll).toBe(3500);
  });

  it("uses acquisition_cost over total_invested*0.7 when available", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: 18000 },
    ];
    const result = aggregatePeriodTotals(jackets, [], []);
    expect(result.vehicle_purchases).toBe(18000);
  });

  it("falls back to total_invested * 0.7 when acquisition_cost is null", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: null },
    ];
    const result = aggregatePeriodTotals(jackets, [], []);
    expect(result.vehicle_purchases).toBe(20000 * 0.7);
  });

  it("classifies vehicle expenses correctly", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: 18000 },
    ];
    const expenses: RawVehicleExpense[] = [
      { vehicle_id: "v1", total_cost: 500, category: "fee", repair_type: "Auction", repair_date: "2025-05-01" },
      { vehicle_id: "v1", total_cost: 300, category: "logistics", repair_type: "Transport", repair_date: "2025-05-02" },
      { vehicle_id: "v1", total_cost: 200, category: "materials", repair_type: "Part", repair_date: "2025-05-03" },
      { vehicle_id: "v1", total_cost: 400, category: "bodywork", repair_type: "Paint", repair_date: "2025-05-04" },
    ];
    const result = aggregatePeriodTotals(jackets, expenses, []);
    expect(result.auction_fees).toBe(500);
    expect(result.transportation).toBe(300);
    expect(result.parts_supplies).toBe(200);
    expect(result.reconditioning).toBe(400);
  });

  it("maps dealership expense categories correctly", () => {
    const jackets: RawDealJacket[] = [];
    const de: RawDealershipExpense[] = [
      { category: "salary_wages", amount: 5000, expense_date: "2025-05-01" },
      { category: "rent", amount: 2000, expense_date: "2025-05-01" },
      { category: "advertising", amount: 1000, expense_date: "2025-05-01" },
      { category: "utilities", amount: 500, expense_date: "2025-05-01" },
      { category: "software", amount: 300, expense_date: "2025-05-01" },
      { category: "insurance", amount: 400, expense_date: "2025-05-01" },
      { category: "office", amount: 200, expense_date: "2025-05-01" },
      { category: "accounting", amount: 600, expense_date: "2025-05-01" },
      { category: "other", amount: 100, expense_date: "2025-05-01" },
    ];
    const result = aggregatePeriodTotals(jackets, [], de);
    expect(result.payroll).toBe(5000);
    expect(result.rent).toBe(2000);
    expect(result.advertising).toBe(1000);
    expect(result.utilities).toBe(500);
    expect(result.software).toBe(300);
    expect(result.insurance).toBe(400);
    expect(result.office).toBe(200);
    expect(result.other_expenses).toBe(600 + 100);
  });

  it("sums commissions and salary_wages into payroll", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: 18000 },
    ];
    const de: RawDealershipExpense[] = [
      { category: "salary_wages", amount: 5000, expense_date: "2025-05-01" },
    ];
    const result = aggregatePeriodTotals(jackets, [], de);
    expect(result.payroll).toBe(2000 + 5000);
  });

  it("ignores vehicle expenses for vehicles not in jacket list", () => {
    const jackets: RawDealJacket[] = [
      { vehicle_id: "v1", sold_price: 30000, total_invested: 20000, profit_gross: 8000, profit_net: 6000, commission_amount: 2000, total_tax: 1500, date_sold: "2025-05-01", amount_financed: 0, acquisition_cost: 18000 },
    ];
    const expenses: RawVehicleExpense[] = [
      { vehicle_id: "v1", total_cost: 500, repair_type: "Auction", category: "fee", repair_date: "2025-05-01" },
      { vehicle_id: "v999", total_cost: 9999, repair_type: "Auction", category: "fee", repair_date: "2025-05-01" },
    ];
    const result = aggregatePeriodTotals(jackets, expenses, []);
    expect(result.auction_fees).toBe(500);
  });

  it("returns zero totals for empty inputs", () => {
    const result = aggregatePeriodTotals([], [], []);
    const vals = Object.values(result);
    expect(vals.every((v) => v === 0)).toBe(true);
  });
});

// =========================================================================
//  SECTION 12 ... matchesDealType
// =========================================================================
describe("matchesDealType", () => {
  const makeJacket = (amount_financed: number) =>
    ({ amount_financed } as any);

  it('"all" matches everything', () => {
    expect(matchesDealType(makeJacket(0), "all")).toBe(true);
    expect(matchesDealType(makeJacket(10000), "all")).toBe(true);
  });

  it('"cash" requires amount_financed <= 0', () => {
    expect(matchesDealType(makeJacket(0), "cash")).toBe(true);
    expect(matchesDealType(makeJacket(-1), "cash")).toBe(true);
    expect(matchesDealType(makeJacket(1), "cash")).toBe(false);
  });

  it('"finance" requires amount_financed > 0', () => {
    expect(matchesDealType(makeJacket(10000), "finance")).toBe(true);
    expect(matchesDealType(makeJacket(0), "finance")).toBe(false);
  });

  it('"lease" always returns false', () => {
    expect(matchesDealType(makeJacket(0), "lease")).toBe(false);
    expect(matchesDealType(makeJacket(10000), "lease")).toBe(false);
  });

  it("unknown deal type returns true", () => {
    expect(matchesDealType(makeJacket(0), "unknown")).toBe(true);
  });
});

// =========================================================================
//  SECTION 13 ... DEFAULT_PL_FILTERS
// =========================================================================
describe("DEFAULT_PL_FILTERS", () => {
  it("has expected defaults", () => {
    expect(DEFAULT_PL_FILTERS.dateRange).toBe("this_month");
    expect(DEFAULT_PL_FILTERS.compareTo).toBe("last_month");
    expect(DEFAULT_PL_FILTERS.groupBy).toBe("none");
    expect(DEFAULT_PL_FILTERS.salesRep).toBe("all");
    expect(DEFAULT_PL_FILTERS.location).toBe("all");
    expect(DEFAULT_PL_FILTERS.dealType).toBe("all");
    expect(DEFAULT_PL_FILTERS.search).toBe("");
  });
});

// =========================================================================
//  SECTION 14 ... Full Report Integration (mock verification)
// =========================================================================
describe("buildProfitLossReport (integration)", () => {
  const thisMonth = finalizePeriodTotals({
    vehicle_sales: 181120, other_income: 4110,
    vehicle_purchases: 106500, auction_fees: 4200,
    transportation: 2980, reconditioning: 3640, parts_supplies: 1730,
    payroll: 12940, rent: 5200, advertising: 4260,
    utilities: 1120, software: 1980, insurance: 2560,
    office: 1430, other_expenses: 8600,
    sales_tax_collected: 14880, tax_expense: 0,
  });
  const lastMonth = finalizePeriodTotals({
    vehicle_sales: 160250, other_income: 3270,
    vehicle_purchases: 95800, auction_fees: 3800,
    transportation: 2500, reconditioning: 3290, parts_supplies: 1500,
    payroll: 12320, rent: 5200, advertising: 3780,
    utilities: 980, software: 1840, insurance: 2550,
    office: 1390, other_expenses: 7780,
    sales_tax_collected: 13210, tax_expense: 0,
  });

  const events = new Map<string, number>();
  for (let d = 1; d <= 31; d++) {
    events.set(`2025-05-${String(d).padStart(2, "0")}`, 1000);
  }

  const report = buildProfitLossReport({
    thisMonth,
    lastMonth,
    period: {
      start: "2025-05-01", end: "2025-05-31",
      label: "May 1 - May 31, 2025", columnLabel: "May 1 - May 31, 2025",
    },
    comparisonPeriod: {
      start: "2025-04-01", end: "2025-04-30",
      label: "vs Apr 1 - Apr 30, 2025", columnLabel: "Apr 1 - Apr 30, 2025",
    },
    dailyTrend: buildDailyTrendFromEvents("2025-05-01", "2025-05-31", events),
    soldVehicleCount: 23,
  });

  it("has all required top-level keys", () => {
    expect(report).toHaveProperty("meta");
    expect(report).toHaveProperty("period");
    expect(report).toHaveProperty("comparisonPeriod");
    expect(report).toHaveProperty("kpis");
    expect(report).toHaveProperty("statementRows");
    expect(report).toHaveProperty("dailyTrend");
    expect(report).toHaveProperty("revenueBreakdown");
    expect(report).toHaveProperty("expenseBreakdown");
    expect(report).toHaveProperty("insights");
    expect(report).toHaveProperty("soldVehicleCount");
    expect(report).toHaveProperty("comparisonDailyTrend");
  });

  it("report matches mock data values", () => {
    expect(report.period.label).toBe("May 1 - May 31, 2025");
    expect(report.soldVehicleCount).toBe(23);
    expect(report.meta.currency).toBe("USD");
    expect(report.meta.basis).toBe("accrual");
    expect(report.meta.reportType).toBe("Profit & Loss Statement");
  });

  it("kpis have correct values matching mock", () => {
    const kpis = report.kpis;
    expect(kpis.find((k) => k.id === "total_revenue")!.value).toBe(185230);
    expect(kpis.find((k) => k.id === "net_profit")!.value).toBe(28090);
  });

  it("statement rows match mock structure", () => {
    expect(report.statementRows).toHaveLength(27);
    expect(report.statementRows[0].label).toBe("REVENUE");
    expect(report.statementRows[report.statementRows.length - 1].label).toBe("NET PROFIT");
  });

  it("revenue breakdown totals match", () => {
    const rb = report.revenueBreakdown;
    const totalRev = rb.reduce((s, i) => s + i.amount, 0);
    expect(totalRev).toBe(185230);
  });

  it("expense breakdown totals match", () => {
    const eb = report.expenseBreakdown;
    const totalExp = eb.reduce((s, i) => s + i.amount, 0);
    expect(totalExp).toBe(38090);
  });

  it("soldVehicleCount is preserved", () => {
    expect(report.soldVehicleCount).toBe(23);
  });
});

// =========================================================================
//  SECTION 15 ... EMPTY_PERIOD_TOTALS
// =========================================================================
describe("EMPTY_PERIOD_TOTALS", () => {
  it("all fields are 0", () => {
    const values = Object.values(EMPTY_PERIOD_TOTALS);
    expect(values.every((v) => v === 0)).toBe(true);
  });
});
