import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Megaphone,
  Settings,
  Shield,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

export type ExpenseFormType = "general" | "vehicle" | "recurring";

export type ExpenseFormCategory =
  | "advertising"
  | "accounting"
  | "office"
  | "salary_wages"
  | "software"
  | "utilities"
  | "rent"
  | "insurance"
  | "other";

export type ExpenseFormCategoryOption = {
  value: ExpenseFormCategory;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

export const EXPENSE_FORM_CATEGORIES: ExpenseFormCategoryOption[] = [
  {
    value: "advertising",
    label: "Advertising Expenses",
    icon: Megaphone,
    iconClassName: "text-purple-400",
  },
  {
    value: "accounting",
    label: "Accounting Expenses",
    icon: Settings,
    iconClassName: "text-teal-400",
  },
  {
    value: "office",
    label: "Office Expenses",
    icon: Building2,
    iconClassName: "text-amber-400",
  },
  {
    value: "salary_wages",
    label: "Salary & Wages Expenses",
    icon: Users,
    iconClassName: "text-orange-400",
  },
  {
    value: "software",
    label: "Software Expenses",
    icon: Wrench,
    iconClassName: "text-blue-400",
  },
  {
    value: "utilities",
    label: "Utilities Expenses",
    icon: Zap,
    iconClassName: "text-yellow-400",
  },
  {
    value: "rent",
    label: "Rent Expenses",
    icon: Building2,
    iconClassName: "text-slate-400",
  },
  {
    value: "insurance",
    label: "Insurance Expenses",
    icon: Shield,
    iconClassName: "text-emerald-400",
  },
  {
    value: "other",
    label: "Other Expenses",
    icon: Settings,
    iconClassName: "text-slate-400",
  },
];

export function getDefaultCategoryForType(
  type: ExpenseFormType | undefined,
): ExpenseFormCategory {
  switch (type) {
    case "recurring":
    case "general":
    default:
      return "advertising";
  }
}

export function getCategoryOption(value: ExpenseFormCategory) {
  return (
    EXPENSE_FORM_CATEGORIES.find((option) => option.value === value) ??
    EXPENSE_FORM_CATEGORIES[0]
  );
}

export const TAX_DEDUCTIBLE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "check", label: "Check" },
  { value: "ach", label: "ACH" },
  { value: "cash", label: "Cash" },
  { value: "debit_card", label: "Debit Card" },
] as const;

export const VEHICLE_EXPENSE_SUBCATEGORIES = [
  { value: "brakes", label: "Brakes" },
  { value: "tires", label: "Tires" },
  { value: "engine", label: "Engine" },
  { value: "transmission", label: "Transmission" },
  { value: "paint_body", label: "Paint & Body" },
  { value: "detail", label: "Detail" },
  { value: "smog", label: "Smog" },
  { value: "inspection", label: "Inspection" },
  { value: "towing", label: "Towing" },
  { value: "parts", label: "Parts" },
  { value: "labor", label: "Labor" },
  { value: "keys", label: "Keys" },
  { value: "registration", label: "Registration" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];
export type VehicleExpenseSubcategory =
  (typeof VEHICLE_EXPENSE_SUBCATEGORIES)[number]["value"];
