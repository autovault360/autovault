import {
  formatCategory,
  formatCurrency,
  type ExpenseCategory,
  type ExpenseDetail,
  type ExpenseFrequency,
} from "@/lib/expenses/types";

export type ExpensePeriodMode = "month" | "year";

export type ExpensePageKpis = {
  totalThisMonth: number;
  totalPaidThisMonth: number;
  recurringMonthly: number;
  recurringCount: number;
  vehicleTotal: number;
  vehicleCount: number;
  payrollTotal: number;
  upcomingTotal: number;
  upcomingCount: number;
};

export type ExpenseBreakdownBucket = {
  key: string;
  color: string;
  amount: number;
  percent: number;
};

export type ExpenseTableFilters = {
  search: string;
  category: ExpenseCategory | "all";
  status: "all" | "paid" | "unpaid";
  frequency: "all" | "recurring" | "one_time";
};

export const SPEND_BUCKETS = [
  { key: "Rent", color: "#3aa0ff" },
  { key: "Payroll", color: "#23d18b" },
  { key: "Auction Fees", color: "#ff9f43" },
  { key: "Flooring Fees", color: "#a07bff" },
  { key: "Repairs", color: "#ff5470" },
  { key: "Marketing", color: "#ff6fb5" },
  { key: "Insurance", color: "#33c2c2" },
  { key: "Utilities", color: "#f4c65a" },
  { key: "Other", color: "#7c8aa0" },
] as const;

const CATEGORY_CHIP_META: Record<
  ExpenseCategory,
  { dot: string; bg: string; text: string }
> = {
  vehicle: { dot: "#ff9f43", bg: "rgba(255,159,67,.14)", text: "#ff9f43" },
  advertising: { dot: "#ff6fb5", bg: "rgba(255,111,181,.14)", text: "#ff6fb5" },
  accounting: { dot: "#33c2c2", bg: "rgba(51,194,194,.14)", text: "#33c2c2" },
  office: { dot: "#3aa0ff", bg: "rgba(58,160,255,.14)", text: "#3aa0ff" },
  salary_wages: { dot: "#23d18b", bg: "rgba(35,209,139,.14)", text: "#23d18b" },
  recurring: { dot: "#a07bff", bg: "rgba(160,123,255,.14)", text: "#a07bff" },
  software: { dot: "#3aa0ff", bg: "rgba(58,160,255,.14)", text: "#3aa0ff" },
  utilities: { dot: "#f4c65a", bg: "rgba(244,198,90,.14)", text: "#f4c65a" },
  rent: { dot: "#3aa0ff", bg: "rgba(58,160,255,.14)", text: "#3aa0ff" },
  insurance: { dot: "#33c2c2", bg: "rgba(51,194,194,.14)", text: "#33c2c2" },
  other: { dot: "#7c8aa0", bg: "rgba(124,138,160,.14)", text: "#7c8aa0" },
};

function parseDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value}T00:00:00`);
}

function isInPeriod(
  expense: ExpenseDetail,
  year: number,
  month: number,
  mode: ExpensePeriodMode,
): boolean {
  const date = parseDate(expense.dueDate);
  if (Number.isNaN(date.getTime())) return false;
  if (mode === "year") return date.getFullYear() === year;
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function spendBucket(category: ExpenseCategory): string {
  switch (category) {
    case "rent":
      return "Rent";
    case "salary_wages":
      return "Payroll";
    case "vehicle":
      return "Repairs";
    case "advertising":
      return "Marketing";
    case "insurance":
      return "Insurance";
    case "utilities":
      return "Utilities";
    default:
      return "Other";
  }
}

function monthlyEquivalent(expense: ExpenseDetail): number {
  const amount = expense.amount;
  switch (expense.frequency) {
    case "weekly":
      return amount * 4.333;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      return 0;
  }
}

export function getCategoryChipMeta(category: ExpenseCategory) {
  return CATEGORY_CHIP_META[category] ?? CATEGORY_CHIP_META.other;
}

export function formatFrequencyLabel(frequency: ExpenseFrequency): string {
  switch (frequency) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    case "yearly":
      return "Annual";
    default:
      return "One-time";
  }
}

export function filterExpensesByPeriod(
  expenses: ExpenseDetail[],
  year: number,
  month: number,
  mode: ExpensePeriodMode,
): ExpenseDetail[] {
  return expenses.filter((expense) => isInPeriod(expense, year, month, mode));
}

export function computeExpensePageKpis(
  expenses: ExpenseDetail[],
  year: number,
  month: number,
  mode: ExpensePeriodMode,
): ExpensePageKpis {
  const periodExpenses = filterExpensesByPeriod(expenses, year, month, mode);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthScoped = expenses.filter((expense) => {
    const date = parseDate(expense.dueDate);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });

  const totalThisMonth = monthScoped.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidThisMonth = monthScoped
    .filter((e) => e.paymentStatus === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const recurringExpenses = periodExpenses.filter((e) => e.isRecurring);
  const recurringMonthly = recurringExpenses.reduce(
    (sum, e) => sum + monthlyEquivalent(e),
    0,
  );

  const vehicleExpenses = periodExpenses.filter((e) => e.vehicleId);
  const vehicleTotal = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const vehicleCount = new Set(
    vehicleExpenses.map((e) => e.vehicleId).filter(Boolean),
  ).size;

  const payrollTotal = periodExpenses
    .filter((e) => e.category === "salary_wages")
    .reduce((sum, e) => sum + e.amount, 0);

  const upcoming = periodExpenses.filter((e) => {
    if (e.paymentStatus === "paid") return false;
    const due = parseDate(e.dueDate);
    return !Number.isNaN(due.getTime()) && due >= today;
  });

  return {
    totalThisMonth,
    totalPaidThisMonth,
    recurringMonthly,
    recurringCount: recurringExpenses.length,
    vehicleTotal,
    vehicleCount,
    payrollTotal,
    upcomingTotal: upcoming.reduce((sum, e) => sum + e.amount, 0),
    upcomingCount: upcoming.length,
  };
}

export function computeExpenseBreakdown(
  expenses: ExpenseDetail[],
  year: number,
  month: number,
  mode: ExpensePeriodMode,
): { buckets: ExpenseBreakdownBucket[]; total: number } {
  const periodExpenses = filterExpensesByPeriod(expenses, year, month, mode);
  const totals = Object.fromEntries(
    SPEND_BUCKETS.map((bucket) => [bucket.key, 0]),
  ) as Record<string, number>;

  for (const expense of periodExpenses) {
    totals[spendBucket(expense.category)] =
      (totals[spendBucket(expense.category)] ?? 0) + expense.amount;
  }

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const buckets = SPEND_BUCKETS.map((bucket) => ({
    key: bucket.key,
    color: bucket.color,
    amount: totals[bucket.key] ?? 0,
    percent: total > 0 ? Math.round(((totals[bucket.key] ?? 0) / total) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return { buckets, total };
}

export function filterExpensesTable(
  expenses: ExpenseDetail[],
  filters: ExpenseTableFilters,
  year: number,
  month: number,
  mode: ExpensePeriodMode,
): ExpenseDetail[] {
  const q = filters.search.trim().toLowerCase();

  return expenses
    .filter((expense) => isInPeriod(expense, year, month, mode))
    .filter((expense) => {
      if (filters.category !== "all" && expense.category !== filters.category) {
        return false;
      }
      if (filters.status === "paid" && expense.paymentStatus !== "paid") {
        return false;
      }
      if (
        filters.status === "unpaid" &&
        expense.paymentStatus === "paid"
      ) {
        return false;
      }
      if (filters.frequency === "recurring" && !expense.isRecurring) {
        return false;
      }
      if (filters.frequency === "one_time" && expense.isRecurring) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        expense.displayName,
        expense.title,
        expense.subtitle,
        expense.vendor,
        expense.notes ?? "",
        expense.linkedVehicle ?? "",
        expense.stockNumber ?? "",
        formatCategory(expense.category),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort(
      (a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime(),
    );
}

export function isExpenseOverdue(expense: ExpenseDetail): boolean {
  if (expense.paymentStatus === "paid") return false;
  const due = parseDate(expense.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(due.getTime()) && due < today;
}

export function formatKpiCurrency(value: number): string {
  return formatCurrency(value);
}
