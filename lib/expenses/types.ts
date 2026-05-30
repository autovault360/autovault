export type ExpenseCategory =
  | "vehicle"
  | "advertising"
  | "accounting"
  | "office"
  | "salary_wages"
  | "recurring";

export type ExpenseListItem = {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  subtitle: string;
  hasReceipt: boolean;
  paymentMethod: string;
  amount: number;
};

export type ExpenseDetail = ExpenseListItem & {
  vendor: string;
  linkedVehicle: string | null;
  stockNumber: string | null;
  transactionId: string;
  receiptUploadedAt: string | null;
  notes: string | null;
  addedBy: string;
  description: string;
  createdAt: string;
  receiptImageUrl: string | null;
};

export type ExpenseStats = {
  totalExpensesMtd: number;
  totalExpensesMtdDelta: string;
  totalExpensesMtdDeltaColor: "green" | "red";
  totalExpensesYtd: number;
  totalExpensesYtdDelta: string;
  totalExpensesYtdDeltaColor: "green" | "red";
  averageDailyExpense: number;
  averageDailyExpenseDelta: string;
  averageDailyExpenseDeltaColor: "green" | "red";
  revenuePercentMtd: number;
  revenuePercentMtdDelta: string;
  revenuePercentMtdDeltaColor: "green" | "red";
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "vehicle",
  "advertising",
  "accounting",
  "office",
  "salary_wages",
  "recurring",
];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  vehicle: "Vehicle Expenses",
  advertising: "Advertising Expenses",
  accounting: "Accounting Expenses",
  office: "Office Expenses",
  salary_wages: "Salary & Wages",
  recurring: "Recurring Expenses",
};

export function formatCategory(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryStyle(category: ExpenseCategory): string {
  switch (category) {
    case "vehicle":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "advertising":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "accounting":
      return "bg-teal-500/15 text-teal-400 border-teal-500/30";
    case "office":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "salary_wages":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "recurring":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDisplayDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getExpenseDetail(
  expenses: ExpenseDetail[],
  id: string,
): ExpenseDetail | null {
  return expenses.find((e) => e.id === id) ?? null;
}
