import type {
  CpaDashboardData,
  CpaDealJacketSegment,
  CpaExpenseCategory,
  CpaKpi,
  CpaStorageFolder,
  CpaTopEarner,
  CpaVehicleHighlight,
  CpaVehicleLossStats,
  CpaVehicleProfitStats,
  CpaViewMode,
} from "@/lib/cpa/types";
import type { PeriodTotals } from "@/lib/profit-loss/build-report";
import {
  aggregateCpaPeriod,
  countDistinctPayrollEmployees,
  countInventoryRemaining,
  countVehiclesAdded,
  countVehiclesPurchased,
  fetchAllDealJacketsForStatus,
  fetchJacketsInRangeExtended,
  fetchNextPayrollEventDate,
  fetchStorageFileCounts,
  mapVehiclesSold,
  sumBenefits,
  sumBonuses,
  sumPaidCommissions,
  sumPayrollTaxes,
  sumSalaryWages,
  sumTaxPayments,
  type DealJacketStatusRow,
  type JacketRow,
} from "./fetch-period-data";
import {
  boundsForCalendarMonth,
  monthRangeForTrend,
  resolveCpaPeriodBounds,
} from "./period-utils";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EXPENSE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#14b8a6",
  "#ef4444",
  "#64748b",
];

const DEAL_JACKET_COLORS: Record<string, string> = {
  Completed: "#22c55e",
  "Missing Docs": "#ef4444",
  "Pending Signatures": "#f97316",
  "Funding Pending": "#3b82f6",
  Other: "#64748b",
};

const CPA_STORAGE_FOLDERS: Array<{
  id: string;
  name: string;
  iconColor: string;
}> = [
  { id: "bank", name: "Bank Statements", iconColor: "blue" },
  { id: "payroll", name: "Payroll Reports", iconColor: "orange" },
  { id: "tax", name: "Tax Documents", iconColor: "red" },
  { id: "deals", name: "Deal Jackets", iconColor: "green" },
  { id: "receipts", name: "Expense Receipts", iconColor: "purple" },
  { id: "audit", name: "Audit Files", iconColor: "teal" },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatDelta(
  current: number,
  previous: number,
  prevMonth: number,
  prevYear: number,
  invertPositive = false,
): { delta: string; deltaPositive: boolean } {
  const change = pctChange(current, previous);
  const arrow = change >= 0 ? "↑" : "↓";
  let positive = change >= 0;
  if (invertPositive) positive = change <= 0;
  return {
    delta: `${arrow} ${Math.abs(change).toFixed(2)}%`,
    deltaPositive: positive,
  };
}

function formatPrevPeriodLabel(
  view: CpaViewMode,
  prevMonth: number,
  prevYear: number,
): string {
  if (view === "yearly") {
    return `January 1 – December 31, ${prevYear}`;
  }
  const monthName = MONTH_NAMES_FULL[prevMonth - 1] ?? "January";
  const lastDay = new Date(prevYear, prevMonth, 0).getDate();
  return `${monthName} 1 – ${monthName} ${lastDay}, ${prevYear}`;
}

function vehicleLabel(row: JacketRow): string {
  const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
  const year = vehicle?.year ?? 0;
  const make = vehicle?.make ?? "";
  const model = vehicle?.model ?? "";
  return `${year} ${make} ${model}`.trim() || "Unknown Vehicle";
}

function buildExpenseCategories(totals: PeriodTotals): CpaExpenseCategory[] {
  const vehicleRepairs = totals.reconditioning + totals.parts_supplies;
  const rentUtilities = totals.rent + totals.utilities;
  const raw: { label: string; amount: number }[] = [
    { label: "Advertising", amount: totals.advertising },
    { label: "Rent", amount: totals.rent },
    { label: "Office Supplies", amount: totals.office },
    { label: "Vehicle Expenses", amount: vehicleRepairs },
    { label: "Insurance", amount: totals.insurance },
    { label: "Payroll Expenses", amount: totals.payroll },
    { label: "Miscellaneous", amount: totals.other_expenses + totals.software },
    { label: "Rent & Utilities", amount: rentUtilities },
  ].filter((c) => c.amount > 0);

  const total = totals.total_expenses || raw.reduce((s, c) => s + c.amount, 0) || 1;

  return raw.map((c, i) => ({
    label: c.label,
    amount: c.amount,
    pct: Math.round((c.amount / total) * 1000) / 10,
    color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
  }));
}

function buildVehicleProfitStats(
  jackets: JacketRow[],
  totalRevenue: number,
  grossProfit: number,
): CpaVehicleProfitStats {
  const total = jackets.length;
  const profitable = jackets.filter((j) => Number(j.profit_gross) > 0);
  const totalProfit = profitable.reduce((s, j) => s + Number(j.profit_gross), 0);

  const sortedByProfit = [...jackets].sort(
    (a, b) => Number(b.profit_gross) - Number(a.profit_gross),
  );
  const highest = sortedByProfit[0];
  const lowestProfitable = [...profitable].sort(
    (a, b) => Number(a.profit_gross) - Number(b.profit_gross),
  )[0];

  const emptyHighlight: CpaVehicleHighlight = { amount: 0, vehicle: "N/A" };

  return {
    totalVehiclesSold: total,
    profitableCount: profitable.length,
    profitPct: total > 0 ? Math.round((profitable.length / total) * 10000) / 100 : 0,
    totalProfit,
    avgProfitPerVehicle:
      profitable.length > 0 ? Math.round(totalProfit / profitable.length) : 0,
    highestProfit: highest
      ? { amount: Number(highest.profit_gross), vehicle: vehicleLabel(highest) }
      : emptyHighlight,
    lowestProfit: lowestProfitable
      ? {
          amount: Number(lowestProfitable.profit_gross),
          vehicle: vehicleLabel(lowestProfitable),
        }
      : emptyHighlight,
    grossProfitMargin:
      totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0,
  };
}

function buildVehicleLossStats(
  jackets: JacketRow[],
  totalRevenue: number,
): CpaVehicleLossStats {
  const total = jackets.length;
  const lossVehicles = jackets.filter((j) => Number(j.profit_gross) < 0);
  const totalLoss = lossVehicles.reduce(
    (s, j) => s + Math.abs(Number(j.profit_gross)),
    0,
  );

  const sortedByLoss = [...lossVehicles].sort(
    (a, b) => Number(a.profit_gross) - Number(b.profit_gross),
  );
  const highest = sortedByLoss[0];
  const lowest = sortedByLoss[sortedByLoss.length - 1];

  const returnedToAuction = lossVehicles.filter((j) => {
    const vehicle = Array.isArray(j.vehicle) ? j.vehicle[0] : j.vehicle;
    const purchaseType = (vehicle?.purchase_type ?? "").toLowerCase();
    return purchaseType.includes("auction");
  }).length;

  const emptyHighlight: CpaVehicleHighlight = { amount: 0, vehicle: "N/A" };

  return {
    lossCount: lossVehicles.length,
    lossPct: total > 0 ? Math.round((lossVehicles.length / total) * 10000) / 100 : 0,
    totalLoss,
    avgLossPerVehicle:
      lossVehicles.length > 0 ? Math.round(totalLoss / lossVehicles.length) : 0,
    highestLoss: highest
      ? {
          amount: Math.abs(Number(highest.profit_gross)),
          vehicle: vehicleLabel(highest),
        }
      : emptyHighlight,
    lowestLoss: lowest
      ? {
          amount: Math.abs(Number(lowest.profit_gross)),
          vehicle: vehicleLabel(lowest),
        }
      : emptyHighlight,
    returnedToAuction,
    lossImpactPct:
      totalRevenue > 0
        ? Math.round((totalLoss / totalRevenue) * -10000) / 100
        : 0,
  };
}

function buildTopEarners(
  extendedJackets: Awaited<ReturnType<typeof fetchJacketsInRangeExtended>>,
): CpaTopEarner[] {
  const byRep = new Map<string, { name: string; commissions: number }>();

  for (const row of extendedJackets) {
    const salesRep = Array.isArray(row.sales_rep) ? row.sales_rep[0] : row.sales_rep;
    const repId = row.sales_rep_id ?? "unassigned";
    const repName = salesRep?.full_name ?? "Unassigned";
    const existing = byRep.get(repId) ?? { name: repName, commissions: 0 };
    existing.commissions += Number(row.commission_amount);
    byRep.set(repId, existing);
  }

  return [...byRep.values()]
    .sort((a, b) => b.commissions - a.commissions)
    .slice(0, 5)
    .map((rep, i) => ({
      rank: i + 1,
      name: rep.name,
      amount: rep.commissions,
    }));
}

function classifyJacketStatus(row: DealJacketStatusRow): string {
  if (row.document_count === 0) return "Missing Docs";
  if (row.amount_financed > 0 && row.balance_due > 0.01) return "Funding Pending";
  if (row.balance_due > 0.01) return "Pending Signatures";
  if (row.document_count > 0 && row.balance_due <= 0.01) return "Completed";
  return "Other";
}

function buildDealJacketSegments(
  rows: DealJacketStatusRow[],
): { segments: CpaDealJacketSegment[]; total: number } {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const status = classifyJacketStatus(row);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  const total = rows.length;
  const order = [
    "Completed",
    "Missing Docs",
    "Pending Signatures",
    "Funding Pending",
    "Other",
  ];

  const segments: CpaDealJacketSegment[] = order
    .filter((name) => (counts.get(name) ?? 0) > 0)
    .map((name) => {
      const count = counts.get(name) ?? 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name,
        value: pct,
        color: DEAL_JACKET_COLORS[name] ?? "#64748b",
      };
    });

  return { segments, total };
}

async function buildTotalsChart(
  dealershipId: string,
  view: CpaViewMode,
  month: number,
  year: number,
  pick: (t: PeriodTotals) => number,
): Promise<{ name: string; value: number }[]> {
  const months = monthRangeForTrend(view, month, year, 12);
  const values: { name: string; value: number }[] = [];

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const { totals } = await aggregateCpaPeriod(dealershipId, start, end);
    values.push({ name: m.label, value: Math.round(pick(totals)) });
  }

  return values;
}

async function buildPayrollChart(
  dealershipId: string,
  view: CpaViewMode,
  month: number,
  year: number,
): Promise<{ name: string; value: number }[]> {
  const months = monthRangeForTrend(view, month, year, 12);
  const values: { name: string; value: number }[] = [];

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const period = await aggregateCpaPeriod(dealershipId, start, end);
    const value =
      sumSalaryWages(period.dealershipExpenses) +
      sumPaidCommissions(period.jackets);
    values.push({ name: m.label, value: Math.round(value) });
  }

  return values;
}

async function buildLossChart(
  dealershipId: string,
  view: CpaViewMode,
  month: number,
  year: number,
): Promise<{ name: string; value: number }[]> {
  const months = monthRangeForTrend(view, month, year, 12);
  const values: { name: string; value: number }[] = [];

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const period = await aggregateCpaPeriod(dealershipId, start, end);
    const totalLoss = buildVehicleLossStats(period.jackets, period.totals.total_revenue)
      .totalLoss;
    values.push({ name: m.label, value: Math.round(totalLoss) });
  }

  return values;
}

async function buildCommissionsChart(
  dealershipId: string,
  view: CpaViewMode,
  month: number,
  year: number,
): Promise<{ name: string; value: number }[]> {
  const months = monthRangeForTrend(view, month, year, 12);
  const values: { name: string; value: number }[] = [];

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const period = await aggregateCpaPeriod(dealershipId, start, end);
    values.push({
      name: m.label,
      value: Math.round(sumPaidCommissions(period.jackets)),
    });
  }

  return values;
}

function buildStorageFolders(counts: Map<string, number>): CpaStorageFolder[] {
  return CPA_STORAGE_FOLDERS.map((folder) => ({
    id: folder.id,
    name: folder.name,
    fileCount: counts.get(folder.id) ?? 0,
    iconColor: folder.iconColor,
  }));
}

function salesTaxStatus(balanceDue: number): "DUE SOON" | "PAID" | "OVERDUE" {
  if (balanceDue <= 0) return "PAID";
  if (balanceDue > 5000) return "OVERDUE";
  return "DUE SOON";
}

export async function buildCpaDashboardData(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaDashboardData> {
  const { view, month, year } = params;
  const bounds = resolveCpaPeriodBounds(view, month, year);
  const monthLabel = MONTH_NAMES[month - 1] ?? "May";

  const [
    current,
    previous,
    vehiclesPurchased,
    vehiclesPurchasedPrev,
    vehiclesAdded,
    vehiclesAddedPrev,
    inventoryRemaining,
    dealJacketRows,
    fileCounts,
    nextPayrollDate,
  ] = await Promise.all([
    aggregateCpaPeriod(dealershipId, bounds.start, bounds.end),
    aggregateCpaPeriod(dealershipId, bounds.prevStart, bounds.prevEnd),
    countVehiclesPurchased(dealershipId, bounds.start, bounds.end),
    countVehiclesPurchased(dealershipId, bounds.prevStart, bounds.prevEnd),
    countVehiclesAdded(dealershipId, bounds.start, bounds.end),
    countVehiclesAdded(dealershipId, bounds.prevStart, bounds.prevEnd),
    countInventoryRemaining(dealershipId),
    fetchAllDealJacketsForStatus(dealershipId),
    fetchStorageFileCounts(dealershipId),
    fetchNextPayrollEventDate(dealershipId),
  ]);

  const cur = current.totals;
  const prev = previous.totals;
  const vehiclesSoldCount = current.jackets.length;
  const vehiclesSoldPrevCount = previous.jackets.length;

  const salaryWages = sumSalaryWages(current.dealershipExpenses);
  const commissionsPaid = sumPaidCommissions(current.jackets);
  const payrollPaid = salaryWages + commissionsPaid;
  const payrollPaidPrev =
    sumSalaryWages(previous.dealershipExpenses) +
    sumPaidCommissions(previous.jackets);

  const taxPaymentsMade = sumTaxPayments(current.dealershipExpenses);
  const taxableSales = cur.vehicle_sales;
  const taxCollected = cur.sales_tax_collected;
  const balanceDue = Math.max(0, taxCollected - taxPaymentsMade);

  const dueDateObj = new Date(year, month + 1, 0);
  const dueDate = dueDateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const revenueDelta = formatDelta(
    cur.total_revenue,
    prev.total_revenue,
    bounds.prevMonth,
    bounds.prevYear,
  );
  const grossDelta = formatDelta(
    cur.gross_profit,
    prev.gross_profit,
    bounds.prevMonth,
    bounds.prevYear,
  );
  const netDelta = formatDelta(
    cur.net_profit,
    prev.net_profit,
    bounds.prevMonth,
    bounds.prevYear,
  );
  const expDelta = formatDelta(
    cur.total_expenses,
    prev.total_expenses,
    bounds.prevMonth,
    bounds.prevYear,
    true,
  );
  const payrollDelta = formatDelta(
    payrollPaid,
    payrollPaidPrev,
    bounds.prevMonth,
    bounds.prevYear,
    true,
  );
  const bonusesPaid = sumBonuses(current.dealershipExpenses);
  const payrollTaxes = sumPayrollTaxes(current.dealershipExpenses);
  const benefitsPaid = sumBenefits(current.dealershipExpenses);
  const deductions = payrollTaxes + benefitsPaid;

  const vehicleProfitStats = buildVehicleProfitStats(
    current.jackets,
    cur.total_revenue,
    cur.gross_profit,
  );
  const vehicleLossStats = buildVehicleLossStats(current.jackets, cur.total_revenue);

  const lossDelta = formatDelta(
    vehicleLossStats.totalLoss,
    buildVehicleLossStats(previous.jackets, prev.total_revenue).totalLoss,
    bounds.prevMonth,
    bounds.prevYear,
    true,
  );

  const extendedJackets = await fetchJacketsInRangeExtended(
    dealershipId,
    bounds.start,
    bounds.end,
  );

  const periodStart = new Date(bounds.start);
  const periodEnd = new Date(bounds.end);
  const daysInPeriod =
    Math.round(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const monthlyBudget = prev.total_expenses;
  const vsBudgetPct =
    monthlyBudget > 0
      ? Math.round(((cur.total_expenses - monthlyBudget) / monthlyBudget) * 10000) / 100
      : 0;

  const totalPayments = salaryWages + commissionsPaid + bonusesPaid;
  const payrollBreakdown = [
    { label: "Salaries & Wages", amount: salaryWages },
    { label: "Payroll Taxes", amount: payrollTaxes },
    { label: "Benefits", amount: benefitsPaid },
    { label: "Bonuses", amount: bonusesPaid },
    { label: "Commissions", amount: commissionsPaid },
  ].filter((item) => item.amount > 0);

  const topEarners = buildTopEarners(extendedJackets);

  const quarter = Math.ceil(month / 3);
  const upcomingFiling = `California Q${quarter} Filing`;

  const prevPeriodLabel = formatPrevPeriodLabel(
    view,
    bounds.prevMonth,
    bounds.prevYear,
  );

  const [
    revenueChart,
    grossChart,
    lossChart,
    netChart,
    expChart,
    payrollChart,
    trendPoints,
  ] = await Promise.all([
    buildTotalsChart(dealershipId, view, month, year, (t) => t.total_revenue),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.gross_profit),
    buildLossChart(dealershipId, view, month, year),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.net_profit),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.total_expenses),
    buildPayrollChart(dealershipId, view, month, year),
    (async () => {
      const months = monthRangeForTrend(view, month, year);
      const points = [];
      for (const m of months) {
        const { start, end } = boundsForCalendarMonth(m.month, m.year);
        const { totals } = await aggregateCpaPeriod(dealershipId, start, end);
        points.push({
          month: m.label,
          revenue: totals.total_revenue,
          netProfit: totals.net_profit,
        });
      }
      return points;
    })(),
  ]);

  const kpis: CpaKpi[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(cur.total_revenue),
      delta: revenueDelta.delta,
      deltaPositive: revenueDelta.deltaPositive,
      icon: "dollar-sign",
      color: "purple",
      chartData: revenueChart,
    },
    {
      label: "Gross Profit",
      value: formatCurrency(cur.gross_profit),
      delta: grossDelta.delta,
      deltaPositive: grossDelta.deltaPositive,
      icon: "trending-up",
      color: "green",
      chartData: grossChart,
    },
    {
      label: "Total Loss",
      value: formatCurrency(vehicleLossStats.totalLoss),
      delta: lossDelta.delta,
      deltaPositive: lossDelta.deltaPositive,
      icon: "trending-down",
      color: "red",
      chartData: lossChart,
    },
    {
      label: "Total Payroll",
      value: formatCurrency(payrollPaid),
      delta: payrollDelta.delta,
      deltaPositive: payrollDelta.deltaPositive,
      icon: "users",
      color: "purple",
      chartData: payrollChart,
    },
    {
      label: "Total Expenses",
      value: formatCurrency(cur.total_expenses),
      delta: expDelta.delta,
      deltaPositive: expDelta.deltaPositive,
      icon: "wallet",
      color: "orange",
      chartData: expChart,
    },
    {
      label: "Net Profit",
      value: formatCurrency(cur.net_profit),
      delta: netDelta.delta,
      deltaPositive: netDelta.deltaPositive,
      icon: "pie-chart",
      color: "blue",
      chartData: netChart,
    },
  ];

  const purchasedDelta = formatDelta(
    vehiclesPurchased,
    vehiclesPurchasedPrev,
    bounds.prevMonth,
    bounds.prevYear,
  );
  const soldDelta = formatDelta(
    vehiclesSoldCount,
    vehiclesSoldPrevCount,
    bounds.prevMonth,
    bounds.prevYear,
  );
  const addedDelta = formatDelta(
    vehiclesAdded,
    vehiclesAddedPrev,
    bounds.prevMonth,
    bounds.prevYear,
  );

  const currentMargin = cur.total_revenue
    ? (cur.net_profit / cur.total_revenue) * 100
    : 0;
  const prevMargin = prev.total_revenue
    ? (prev.net_profit / prev.total_revenue) * 100
    : 0;

  const { segments, total: dealJacketsTotal } = buildDealJacketSegments(dealJacketRows);

  const dataAsOf = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const periodLabel =
    view === "yearly" ? String(year) : `${monthLabel} ${year}`;

  return {
    dataAsOf: `${periodLabel} - Updated ${dataAsOf}`,
    prevPeriodLabel,
    kpis,
    salesActivity: [
      {
        label: "Vehicles Purchased",
        value: vehiclesPurchased,
        delta: purchasedDelta.delta,
        deltaPositive: purchasedDelta.deltaPositive,
        icon: "car",
      },
      {
        label: "Vehicles Sold",
        value: vehiclesSoldCount,
        delta: soldDelta.delta,
        deltaPositive: soldDelta.deltaPositive,
        icon: "tag",
      },
      {
        label: "Inventory Added",
        value: vehiclesAdded,
        delta: addedDelta.delta,
        deltaPositive: addedDelta.deltaPositive,
        icon: "leaf",
      },
      {
        label: "Inventory Remaining",
        value: inventoryRemaining,
        icon: "bar-chart-3",
      },
    ],
    vehiclesSold: mapVehiclesSold(current.jackets),
    vehiclesSoldTotal: vehiclesSoldCount,
    vehicleProfitStats,
    vehicleLossStats,
    salesTax: {
      taxableSales,
      taxCollected,
      taxPaymentsMade,
      balanceDue,
      filingFrequency: "Monthly",
      dueDate,
      status: salesTaxStatus(balanceDue),
    },
    salesTaxPanel: {
      taxCollected,
      taxPaid: taxPaymentsMade,
      taxDue: balanceDue,
      effectiveTaxRate:
        taxableSales > 0
          ? Math.round((taxCollected / taxableSales) * 10000) / 100
          : 0,
      upcomingFiling,
      filingDueDate: dueDate,
      vehiclesIncluded: vehiclesSoldCount,
    },
    payroll: {
      totalPayroll: payrollPaid,
      employeesPaid: countDistinctPayrollEmployees(
        current.dealershipExpenses,
        current.jackets,
      ),
      commissionsPaid,
      bonusesPaid,
      payrollTaxes,
      nextPayrollDate: nextPayrollDate
        ? new Date(`${nextPayrollDate}T12:00:00`).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
    },
    payrollPanel: {
      totalPayroll: salaryWages,
      totalCommissions: commissionsPaid,
      bonuses: bonusesPaid,
      payrollTaxes,
      deductions,
      totalPayments,
      payrollBreakdown,
      topEarners,
    },
    expensePanel: {
      totalExpenses: cur.total_expenses,
      expenseRatio:
        cur.total_revenue > 0
          ? Math.round((cur.total_expenses / cur.total_revenue) * 10000) / 100
          : 0,
      dailyAverage:
        daysInPeriod > 0 ? Math.round(cur.total_expenses / daysInPeriod) : 0,
      monthlyBudget,
      vsBudgetPct,
      categories: buildExpenseCategories(cur),
    },
    profitLoss: [
      {
        label: "Revenue",
        current: cur.total_revenue,
        previous: prev.total_revenue,
        changePct: pctChange(cur.total_revenue, prev.total_revenue),
      },
      {
        label: "Cost Of Goods Sold",
        current: cur.total_cogs,
        previous: prev.total_cogs,
        changePct: pctChange(cur.total_cogs, prev.total_cogs),
      },
      {
        label: "Gross Profit",
        current: cur.gross_profit,
        previous: prev.gross_profit,
        changePct: pctChange(cur.gross_profit, prev.gross_profit),
      },
      {
        label: "Expenses",
        current: cur.total_expenses,
        previous: prev.total_expenses,
        changePct: pctChange(cur.total_expenses, prev.total_expenses),
      },
      {
        label: "Net Profit",
        current: cur.net_profit,
        previous: prev.net_profit,
        changePct: pctChange(cur.net_profit, prev.net_profit),
      },
      {
        label: "Net Margin",
        current: currentMargin,
        previous: prevMargin,
        changePct: currentMargin - prevMargin,
        isMargin: true,
      },
    ],
    trend: trendPoints,
    dealJackets: segments,
    dealJacketsTotal,
    storageFolders: buildStorageFolders(fileCounts),
    notePreviews: [],
    notesSummary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
  };
}
