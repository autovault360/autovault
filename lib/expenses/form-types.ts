import type { LucideIcon } from "lucide-react";
import {
  Car,
  Folder,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";

export type ExpenseFormType = "general" | "vehicle" | "recurring";

export type ExpenseFormCategory =
  | "all"
  | "recurring"
  | "advertising"
  | "vehicle"
  | "salary_wages"
  | "other";

export type ExpenseFormCategoryOption = {
  value: ExpenseFormCategory;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

export const EXPENSE_FORM_CATEGORIES: ExpenseFormCategoryOption[] = [
  {
    value: "all",
    label: "All Expenses",
    icon: Folder,
    iconClassName: "text-blue-400",
  },
  {
    value: "recurring",
    label: "Recurring Expenses",
    icon: Folder,
    iconClassName: "text-emerald-400",
  },
  {
    value: "advertising",
    label: "Advertising Expenses",
    icon: Megaphone,
    iconClassName: "text-purple-400",
  },
  {
    value: "vehicle",
    label: "Vehicle Expenses",
    icon: Car,
    iconClassName: "text-blue-400",
  },
  {
    value: "salary_wages",
    label: "Salary & Wages Expenses",
    icon: Users,
    iconClassName: "text-orange-400",
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
    case "vehicle":
      return "vehicle";
    case "recurring":
      return "recurring";
    case "general":
    default:
      return "all";
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
