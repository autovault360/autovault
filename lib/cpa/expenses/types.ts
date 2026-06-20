import type { KPIIconName } from "@/components/ui/kpi-card";
import type { CpaViewMode } from "@/lib/cpa/types";

export type CpaExpenseCategoryRow = {
  id: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
  vsPriorPct: number;
  vsPriorDirection: "up" | "down" | "flat";
  ytd: number;
  avgMonthly: number;
  sparkline: number[];
} & Record<string, unknown>;

export type CpaExpensesTrendPoint = {
  label: string;
  expenses: number;
};

export type CpaExpensesKpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaColor?: "green" | "red" | "blue" | "orange" | "teal" | "neutral" | "violet";
  icon: KPIIconName;
  color: string;
};

export type CpaExpensesPageData = {
  periodLabel: string;
  comparisonLabel: string;
  dataAsOf: string;
  view: CpaViewMode;
  year: number;
  kpis: CpaExpensesKpi[];
  categories: CpaExpenseCategoryRow[];
  breakdownTotal: number;
  trend: CpaExpensesTrendPoint[];
  categoryOptions: string[];
};
