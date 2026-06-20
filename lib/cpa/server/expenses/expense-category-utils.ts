import type { PeriodTotals } from "@/lib/profit-loss/build-report";

export type CpaExpenseCategoryDef = {
  id: string;
  label: string;
  color: string;
  getAmount: (totals: PeriodTotals) => number;
};

/** CPA expense report categories - aligned with admin P&L + vehicle repair COGS. */
export const CPA_EXPENSE_CATEGORY_DEFS: CpaExpenseCategoryDef[] = [
  {
    id: "payroll",
    label: "Payroll",
    color: "#a855f7",
    getAmount: (t) => t.payroll,
  },
  {
    id: "advertising",
    label: "Advertising & Marketing",
    color: "#3b82f6",
    getAmount: (t) => t.advertising,
  },
  {
    id: "rent",
    label: "Rent & Lease",
    color: "#f97316",
    getAmount: (t) => t.rent,
  },
  {
    id: "utilities",
    label: "Utilities",
    color: "#22c55e",
    getAmount: (t) => t.utilities,
  },
  {
    id: "repairs",
    label: "Repairs & Maintenance",
    color: "#eab308",
    getAmount: (t) => t.reconditioning + t.parts_supplies,
  },
  {
    id: "insurance",
    label: "Insurance",
    color: "#6366f1",
    getAmount: (t) => t.insurance,
  },
  {
    id: "office",
    label: "Office Supplies",
    color: "#14b8a6",
    getAmount: (t) => t.office,
  },
  {
    id: "other",
    label: "Other Expenses",
    color: "#64748b",
    getAmount: (t) => t.other_expenses + t.software,
  },
];

export function sumCategoryAmounts(totals: PeriodTotals): number {
  return CPA_EXPENSE_CATEGORY_DEFS.reduce(
    (sum, def) => sum + def.getAmount(totals),
    0,
  );
}

export function getCategoryAmounts(
  totals: PeriodTotals,
): Record<string, number> {
  return Object.fromEntries(
    CPA_EXPENSE_CATEGORY_DEFS.map((def) => [def.id, def.getAmount(totals)]),
  );
}

export function pctOfTotal(amount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((amount / total) * 1000) / 10;
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}
