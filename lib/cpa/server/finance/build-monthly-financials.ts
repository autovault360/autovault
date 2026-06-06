import type {
  CpaDealJacketStatusSegment,
  CpaExpenseCategory,
  CpaMetricTrend,
  CpaMonthlyFinancialsData,
  CpaMonthlyNoteItem,
  CpaSalesRepRank,
} from "@/lib/cpa/types";
import type { PeriodTotals } from "@/lib/profit-loss/build-report";
import {
  aggregateCpaPeriod,
  countDistinctPayrollEmployees,
  fetchAllDealJacketsForStatus,
  fetchJacketsInRangeExtended,
  fetchStorageFileCounts,
  fetchVehiclesPurchasedInRange,
  mapMonthlyVehiclesPurchased,
  mapMonthlyVehiclesSold,
  sumAllCommissions,
  sumBenefits,
  sumBonuses,
  sumFinanceCommissions,
  sumPaidCommissions,
  sumPayrollTaxes,
  sumSalaryWages,
  sumTaxPayments,
  type DealJacketStatusRow,
} from "./fetch-period-data";
import { boundsForCalendarMonth, resolveCpaPeriodBounds } from "./period-utils";

const MONTH_NAMES = [
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

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DEAL_JACKET_COLORS: Record<string, string> = {
  Completed: "#22c55e",
  "Missing Docs": "#ef4444",
  "Pending Signatures": "#f97316",
  "Pending Funding": "#3b82f6",
  Other: "#64748b",
};

const EXPENSE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#14b8a6",
  "#ef4444",
  "#64748b",
];

const CPA_STORAGE_FOLDERS = [
  { id: "financial", name: "Financial Reports", iconColor: "blue" },
  { id: "payroll", name: "Payroll Reports", iconColor: "orange" },
  { id: "deals", name: "Deal Jackets", iconColor: "green" },
  { id: "tax", name: "Tax Documents", iconColor: "red" },
  { id: "receipts", name: "Expense Receipts", iconColor: "purple" },
  { id: "bank", name: "Bank Statements", iconColor: "teal" },
];

const REPORT_EXPORTS: CpaMonthlyFinancialsData["reportExports"] = [
  { id: "pl", label: "P&L Statement", format: "pdf" },
  { id: "balance", label: "Balance Sheet", format: "pdf" },
  { id: "trial", label: "Trial Balance", format: "excel" },
  { id: "gl", label: "General Ledger", format: "excel" },
  { id: "sales-tax", label: "Sales Tax Report", format: "pdf" },
  { id: "payroll", label: "Payroll Report", format: "excel" },
  { id: "commission", label: "Commission Report", format: "excel" },
  { id: "deal-jackets", label: "Deal Jacket Summary", format: "pdf" },
];

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function buildMetric(current: number, previous: number): CpaMetricTrend {
  const change = pctChange(current, previous);
  return {
    value: current,
    changePct: Math.abs(Math.round(change * 10) / 10),
    trend: change >= 0 ? "up" : "down",
  };
}

function classifyJacketStatus(row: DealJacketStatusRow): string {
  if (row.document_count === 0) return "Missing Docs";
  if (row.amount_financed > 0 && row.balance_due > 0.01) return "Pending Funding";
  if (row.balance_due > 0.01) return "Pending Signatures";
  if (row.document_count > 0 && row.balance_due <= 0.01) return "Completed";
  return "Other";
}

function buildDealJacketSegmentsForMonth(
  rows: DealJacketStatusRow[],
  jacketIdsInMonth: Set<string>,
): { segments: CpaDealJacketStatusSegment[]; total: number } {
  const filtered = rows.filter((r) => jacketIdsInMonth.has(r.id));
  const counts = new Map<string, number>();
  for (const row of filtered) {
    const status = classifyJacketStatus(row);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  const total = filtered.length;
  const order = [
    "Completed",
    "Missing Docs",
    "Pending Signatures",
    "Pending Funding",
    "Other",
  ];

  const segments: CpaDealJacketStatusSegment[] = order
    .filter((name) => (counts.get(name) ?? 0) > 0)
    .map((name) => {
      const count = counts.get(name) ?? 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name,
        count,
        pct,
        color: DEAL_JACKET_COLORS[name] ?? "#64748b",
      };
    });

  return { segments, total };
}

function buildExpenseCategories(totals: PeriodTotals): CpaExpenseCategory[] {
  const vehicleRepairs = totals.reconditioning + totals.parts_supplies;
  const rentUtilities = totals.rent + totals.utilities;
  const raw: { label: string; amount: number }[] = [
    { label: "Payroll Expenses", amount: totals.payroll },
    { label: "Vehicle Repairs", amount: vehicleRepairs },
    { label: "Advertising", amount: totals.advertising },
    { label: "Rent & Utilities", amount: rentUtilities },
    { label: "Office Supplies", amount: totals.office },
    { label: "Insurance", amount: totals.insurance },
    { label: "Miscellaneous", amount: totals.other_expenses + totals.software },
  ].filter((c) => c.amount > 0);

  const total = totals.total_expenses || raw.reduce((s, c) => s + c.amount, 0) || 1;

  return raw.map((c, i) => ({
    label: c.label,
    amount: c.amount,
    pct: Math.round((c.amount / total) * 1000) / 10,
    color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
  }));
}

function buildSalesRepRanks(
  jacketRows: Awaited<ReturnType<typeof fetchJacketsInRangeExtended>>,
): CpaSalesRepRank[] {
  const byRep = new Map<
    string,
    { name: string; units: number; gross: number; commissions: number }
  >();

  for (const row of jacketRows) {
    const salesRep = Array.isArray(row.sales_rep) ? row.sales_rep[0] : row.sales_rep;
    const repId = row.sales_rep_id ?? "unassigned";
    const repName = salesRep?.full_name ?? "Unassigned";
    const existing = byRep.get(repId) ?? {
      name: repName,
      units: 0,
      gross: 0,
      commissions: 0,
    };
    existing.units += 1;
    existing.gross += Number(row.profit_gross);
    existing.commissions += Number(row.commission_amount);
    byRep.set(repId, existing);
  }

  return [...byRep.entries()]
    .map(([id, data]) => ({
      id,
      name: data.name,
      initials: data.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      unitsSold: data.units,
      grossProfit: data.gross,
      commissions: data.commissions,
    }))
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, 4);
}

function noteRibbonFromCategory(category: string, priority: string): CpaMonthlyNoteItem["ribbon"] {
  const cat = category.toLowerCase();
  if (cat.includes("payroll")) return "amber";
  if (cat.includes("tax") || cat.includes("audit")) return "green";
  if (priority === "URGENT" || priority === "HIGH") return "amber";
  if (priority === "LOW") return "green";
  return "blue";
}

function salesTaxStatus(balanceDue: number): "DUE SOON" | "PAID" | "OVERDUE" {
  if (balanceDue <= 0) return "PAID";
  if (balanceDue > 5000) return "OVERDUE";
  return "DUE SOON";
}

export async function buildCpaMonthlyFinancialsData(
  dealershipId: string,
  params: { month: number; year: number },
  notes: CpaMonthlyNoteItem[] = [],
): Promise<CpaMonthlyFinancialsData> {
  const { month, year } = params;
  const bounds = resolveCpaPeriodBounds("monthly", month, year);
  const monthName = MONTH_NAMES[month - 1] ?? "May";
  const prevMonthName = MONTH_SHORT[bounds.prevMonth - 1] ?? "Apr";
  const { start, end } = boundsForCalendarMonth(month, year);
  const lastDay = new Date(year, month, 0).getDate();

  const [
    current,
    previous,
    extendedJackets,
    purchasedRows,
    allJacketStatus,
    fileCounts,
  ] = await Promise.all([
    aggregateCpaPeriod(dealershipId, bounds.start, bounds.end),
    aggregateCpaPeriod(dealershipId, bounds.prevStart, bounds.prevEnd),
    fetchJacketsInRangeExtended(dealershipId, bounds.start, bounds.end),
    fetchVehiclesPurchasedInRange(dealershipId, bounds.start, bounds.end),
    fetchAllDealJacketsForStatus(dealershipId),
    fetchStorageFileCounts(dealershipId),
  ]);

  const cur = current.totals;
  const prev = previous.totals;

  const salaryWages = sumSalaryWages(current.dealershipExpenses);
  const commissionsPaid = sumPaidCommissions(current.jackets);
  const payrollPaid = salaryWages + commissionsPaid;
  const payrollPaidPrev =
    sumSalaryWages(previous.dealershipExpenses) +
    sumPaidCommissions(previous.jackets);
  const commissionsPrev = sumPaidCommissions(previous.jackets);
  const taxPaymentsMade = sumTaxPayments(current.dealershipExpenses);
  const taxableSales = cur.vehicle_sales;
  const taxCollected = cur.sales_tax_collected;
  const salesTaxOwed = Math.max(0, taxCollected - taxPaymentsMade);

  const dueDateObj = new Date(year, month, 0);
  const dueDate = dueDateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const soldData = mapMonthlyVehiclesSold(extendedJackets);
  const purchasedData = mapMonthlyVehiclesPurchased(purchasedRows);

  const soldTotals = soldData.reduce(
    (acc, v) => ({
      salePrice: acc.salePrice + v.salePrice,
      cogs: acc.cogs + v.cogs,
      grossProfit: acc.grossProfit + v.grossProfit,
    }),
    { salePrice: 0, cogs: 0, grossProfit: 0 },
  );

  const purchasedTotals = purchasedData.reduce(
    (acc, v) => ({
      purchasePrice: acc.purchasePrice + v.purchasePrice,
      cost: acc.cost + v.cost,
    }),
    { purchasePrice: 0, cost: 0 },
  );

  const jacketIdsInMonth = new Set(extendedJackets.map((j) => j.id));
  const { segments: dealSegments, total: dealTotal } = buildDealJacketSegmentsForMonth(
    allJacketStatus,
    jacketIdsInMonth,
  );

  const profitMargin = cur.total_revenue
    ? Math.round((cur.net_profit / cur.total_revenue) * 1000) / 10
    : 0;

  const totalCommissions = sumAllCommissions(current.jackets);
  const financeCommissions = sumFinanceCommissions(current.dealershipExpenses);
  const salesCommissions = Math.max(0, totalCommissions - financeCommissions);
  const otherCommissions = Math.max(
    0,
    commissionsPaid - salesCommissions - financeCommissions,
  );

  const storageFolders = CPA_STORAGE_FOLDERS.map((folder) => {
    let fileCount = fileCounts.get(folder.id) ?? 0;
    if (folder.id === "financial") {
      fileCount = (fileCounts.get("bank") ?? 0) + (fileCounts.get("tax") ?? 0);
    }
    return {
      id: folder.id,
      name: folder.name,
      fileCount,
      iconColor: folder.iconColor,
    };
  });

  return {
    selectedMonth: `${monthName} ${year}`,
    periodSubtitle: `Detailed financial summary and activity for ${monthName} 1 - ${monthName} ${lastDay}, ${year}`,
    prevMonthLabel: `${prevMonthName} ${bounds.prevYear}`,
    metrics: {
      totalRevenue: buildMetric(cur.total_revenue, prev.total_revenue),
      cogs: buildMetric(cur.total_cogs, prev.total_cogs),
      grossProfit: buildMetric(cur.gross_profit, prev.gross_profit),
      totalExpenses: buildMetric(cur.total_expenses, prev.total_expenses),
      netProfit: buildMetric(cur.net_profit, prev.net_profit),
      salesTaxCollected: buildMetric(cur.sales_tax_collected, prev.sales_tax_collected),
      payrollPaid: buildMetric(payrollPaid, payrollPaidPrev),
      commissionsPaid: buildMetric(commissionsPaid, commissionsPrev),
    },
    vehiclesSold: {
      totalCount: extendedJackets.length,
      data: soldData.slice(0, 5),
      totals: soldTotals,
    },
    vehiclesPurchased: {
      totalCount: purchasedRows.length,
      data: purchasedData.slice(0, 5),
      totals: purchasedTotals,
    },
    salesTax: {
      taxableSales,
      taxCollected,
      taxPaymentsMade,
      balanceDue: salesTaxOwed,
      salesTaxOwed,
      filingFrequency: "Monthly",
      dueDate,
      status: salesTaxStatus(salesTaxOwed),
    },
    expenseBreakdown: {
      total: cur.total_expenses,
      categories: buildExpenseCategories(cur),
    },
    profitLossSummary: {
      totalRevenue: cur.total_revenue,
      cogs: cur.total_cogs,
      grossProfit: cur.gross_profit,
      totalExpenses: cur.total_expenses,
      netProfit: cur.net_profit,
      otherIncome: cur.other_income,
      profitMargin,
    },
    topSalesReps: buildSalesRepRanks(extendedJackets),
    payrollCommissions: {
      payroll: {
        totalPayroll: payrollPaid,
        employeesPaid: countDistinctPayrollEmployees(
          current.dealershipExpenses,
          current.jackets,
        ),
        payrollTaxes: sumPayrollTaxes(current.dealershipExpenses),
        benefits: sumBenefits(current.dealershipExpenses),
        bonuses: sumBonuses(current.dealershipExpenses),
      },
      commissions: {
        totalCommissions: commissionsPaid,
        salesCommissions,
        financeCommissions,
        otherCommissions,
      },
    },
    dealJackets: {
      total: dealTotal,
      segments: dealSegments,
    },
    notes,
    storageFolders,
    reportExports: REPORT_EXPORTS,
  };
}

export { noteRibbonFromCategory };
