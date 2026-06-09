import type { ExpenseCategory } from "./types";

export const WHOLESALE_EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> =
  {
    auction_fees: "Auction Fees",
    transportation: "Transportation",
    recon_repairs: "Recon / Repairs",
    storage_fees: "Storage Fees",
    dealer_fees: "Dealer Fees",
    miscellaneous: "Miscellaneous Overhead",
  };

export const WHOLESALE_EXPENSE_STATUSES = [
  { value: "paid", label: "Paid", className: "text-emerald-400" },
  { value: "pending", label: "Pending", className: "text-amber-400" },
  { value: "unpaid", label: "Unpaid", className: "text-red-400" },
] as const;

export type WholesaleExpenseStatus =
  (typeof WHOLESALE_EXPENSE_STATUSES)[number]["value"];

export const WHOLESALE_EXPENSE_TAG_OPTIONS = [
  { value: "tax_deductible", label: "Tax Deductible" },
  { value: "recurring", label: "Recurring" },
  { value: "reimbursable", label: "Reimbursable" },
  { value: "vehicle_related", label: "Vehicle Related" },
] as const;
