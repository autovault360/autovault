import type {
  CpaDashboardData,
  CpaDealJacketSegment,
  CpaKpi,
  CpaStorageFolder,
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
  fetchNextPayrollEventDate,
  fetchStorageFileCounts,
  mapVehiclesSold,
  sumBonuses,
  sumPaidCommissions,
  sumPayrollTaxes,
  sumSalaryWages,
  sumTaxPayments,
  type DealJacketStatusRow,
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
  const arrow = change >= 0 ? "+" : "-";
  const prevLabel = MONTH_NAMES[prevMonth - 1] ?? "";
  let positive = change >= 0;
  if (invertPositive) positive = change <= 0;
  return {
    delta: `${arrow} ${Math.abs(change).toFixed(1)}% vs ${prevLabel} ${prevYear}`,
    deltaPositive: positive,
  };
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
  const commissionsPrev = sumPaidCommissions(previous.jackets);
  const commDelta = formatDelta(
    commissionsPaid,
    commissionsPrev,
    bounds.prevMonth,
    bounds.prevYear,
    true,
  );

  const [
    revenueChart,
    grossChart,
    netChart,
    expChart,
    payrollChart,
    commChart,
    trendPoints,
  ] = await Promise.all([
    buildTotalsChart(dealershipId, view, month, year, (t) => t.total_revenue),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.gross_profit),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.net_profit),
    buildTotalsChart(dealershipId, view, month, year, (t) => t.total_expenses),
    buildPayrollChart(dealershipId, view, month, year),
    buildCommissionsChart(dealershipId, view, month, year),
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
      color: "green",
      chartData: revenueChart,
    },
    {
      label: "Gross Profit",
      value: formatCurrency(cur.gross_profit),
      delta: grossDelta.delta,
      deltaPositive: grossDelta.deltaPositive,
      icon: "bar-chart-3",
      color: "purple",
      chartData: grossChart,
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
    {
      label: "Total Expenses",
      value: formatCurrency(cur.total_expenses),
      delta: expDelta.delta,
      deltaPositive: expDelta.deltaPositive,
      icon: "trending-down",
      color: "red",
      chartData: expChart,
    },
    {
      label: "Payroll Paid",
      value: formatCurrency(payrollPaid),
      delta: payrollDelta.delta,
      deltaPositive: payrollDelta.deltaPositive,
      icon: "landmark",
      color: "teal",
      chartData: payrollChart,
    },
    {
      label: "Commissions Paid",
      value: formatCurrency(commissionsPaid),
      delta: commDelta.delta,
      deltaPositive: commDelta.deltaPositive,
      icon: "car",
      color: "orange",
      chartData: commChart,
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

  return {
    dataAsOf: `${monthLabel} ${year} - Updated ${dataAsOf}`,
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
    salesTax: {
      taxableSales,
      taxCollected,
      taxPaymentsMade,
      balanceDue,
      filingFrequency: "Monthly",
      dueDate,
      status: salesTaxStatus(balanceDue),
    },
    payroll: {
      totalPayroll: payrollPaid,
      employeesPaid: countDistinctPayrollEmployees(
        current.dealershipExpenses,
        current.jackets,
      ),
      commissionsPaid,
      bonusesPaid: sumBonuses(current.dealershipExpenses),
      payrollTaxes: sumPayrollTaxes(current.dealershipExpenses),
      nextPayrollDate: nextPayrollDate
        ? new Date(`${nextPayrollDate}T12:00:00`).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
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
