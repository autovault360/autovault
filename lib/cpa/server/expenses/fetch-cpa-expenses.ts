"use server";

import type { CpaViewMode } from "@/lib/cpa/types";
import type {
  CpaExpenseCategoryRow,
  CpaExpensesKpi,
  CpaExpensesPageData,
  CpaExpensesTrendPoint,
} from "@/lib/cpa/expenses/types";
import { aggregateCpaPeriod } from "../finance/fetch-period-data";
import {
  boundsForCalendarMonth,
  monthRangeForTrend,
  resolveCpaPeriodBounds,
} from "../finance/period-utils";
import {
  CPA_EXPENSE_CATEGORY_DEFS,
  getCategoryAmounts,
  pctChange,
  pctOfTotal,
  sumCategoryAmounts,
} from "./expense-category-utils";

const MONTH_NAMES_FULL = [
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

function formatMoney(n: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(n);
}

function formatPeriodLabel(view: CpaViewMode, month: number, year: number): string {
  if (view === "yearly") return String(year);
  return `${MONTH_NAMES_FULL[month - 1] ?? "January"} ${year}`;
}

function formatComparisonLabel(view: CpaViewMode, month: number, year: number): string {
  if (view === "yearly") return String(year - 1);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${MONTH_NAMES_FULL[prevMonth - 1] ?? "January"} ${prevYear}`;
}

function buildCategoryRows(params: {
  currentAmounts: Record<string, number>;
  previousAmounts: Record<string, number>;
  ytdAmounts: Record<string, number>;
  sparklineByCategory: Record<string, number[]>;
  total: number;
  ytdMonths: number;
}): CpaExpenseCategoryRow[] {
  const {
    currentAmounts,
    previousAmounts,
    ytdAmounts,
    sparklineByCategory,
    total,
    ytdMonths,
  } = params;

  return CPA_EXPENSE_CATEGORY_DEFS.map((def) => {
    const amount = currentAmounts[def.id] ?? 0;
    const previous = previousAmounts[def.id] ?? 0;
    const ytd = ytdAmounts[def.id] ?? 0;
    const change = pctChange(amount, previous);

    return {
      id: def.id,
      label: def.label,
      amount,
      pct: pctOfTotal(amount, total),
      color: def.color,
      vsPriorPct: Math.abs(Math.round(change * 10) / 10),
      vsPriorDirection: change > 0 ? "up" : change < 0 ? "down" : "flat",
      ytd,
      avgMonthly: ytdMonths > 0 ? Math.round(ytd / ytdMonths) : 0,
      sparkline: sparklineByCategory[def.id] ?? [],
    };
  });
}

function buildKpis(params: {
  totalExpenses: number;
  totalExpensesPrev: number;
  totalRevenue: number;
  ytdTotal: number;
  ytdMonths: number;
  categories: CpaExpenseCategoryRow[];
  comparisonLabel: string;
}): CpaExpensesKpi[] {
  const expenseChange = pctChange(params.totalExpenses, params.totalExpensesPrev);
  const expenseRatio =
    params.totalRevenue > 0
      ? Math.round((params.totalExpenses / params.totalRevenue) * 1000) / 10
      : 0;

  const nonZero = params.categories.filter((c) => c.amount > 0);
  const highest = [...nonZero].sort((a, b) => b.amount - a.amount)[0];
  const lowest = [...nonZero].sort((a, b) => a.amount - b.amount)[0];

  return [
    {
      id: "total-expenses",
      label: "Total Expenses",
      value: formatMoney(params.totalExpenses),
      delta: `${expenseChange >= 0 ? "?" : "?"} ${Math.abs(expenseChange).toFixed(1)}% vs ${params.comparisonLabel}`,
      deltaColor: expenseChange > 0 ? "red" : "green",
      icon: "wallet",
      color: "violet",
    },
    {
      id: "avg-monthly",
      label: "Average Monthly Expense",
      value: formatMoney(params.ytdMonths > 0 ? params.ytdTotal / params.ytdMonths : 0),
      delta: "This Year (YTD)",
      deltaColor: "neutral",
      icon: "bar-chart-3",
      color: "blue",
    },
    {
      id: "highest-category",
      label: "Highest Expense Category",
      value: highest?.label ?? "N/A",
      delta: highest
        ? `${formatMoney(highest.amount)} (${highest.pct.toFixed(1)}%)`
        : "No expenses recorded",
      deltaColor: "orange",
      icon: "pie-chart",
      color: "orange",
    },
    {
      id: "lowest-category",
      label: "Lowest Expense Category",
      value: lowest?.label ?? "N/A",
      delta: lowest
        ? `${formatMoney(lowest.amount)} (${lowest.pct.toFixed(1)}%)`
        : "No expenses recorded",
      deltaColor: "green",
      icon: "trending-down",
      color: "green",
    },
    {
      id: "expense-ratio",
      label: "Expenses vs Revenue",
      value: `${expenseRatio.toFixed(1)}%`,
      delta: "vs Revenue",
      deltaColor: "teal",
      icon: "percent",
      color: "teal",
    },
  ];
}

async function buildYearTrend(
  dealershipId: string,
  year: number,
): Promise<CpaExpensesTrendPoint[]> {
  const months = monthRangeForTrend("yearly", 12, year, 12);
  const points: CpaExpensesTrendPoint[] = [];

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const { totals } = await aggregateCpaPeriod(dealershipId, start, end);
    points.push({
      label: m.label,
      expenses: Math.round(sumCategoryAmounts(totals)),
    });
  }

  return points;
}

async function buildSparklines(
  dealershipId: string,
  month: number,
  year: number,
): Promise<Record<string, number[]>> {
  const months = monthRangeForTrend("monthly", month, year, 6);
  const sparklineByCategory: Record<string, number[]> = Object.fromEntries(
    CPA_EXPENSE_CATEGORY_DEFS.map((def) => [def.id, [] as number[]]),
  );

  for (const m of months) {
    const { start, end } = boundsForCalendarMonth(m.month, m.year);
    const { totals } = await aggregateCpaPeriod(dealershipId, start, end);
    const amounts = getCategoryAmounts(totals);
    for (const def of CPA_EXPENSE_CATEGORY_DEFS) {
      sparklineByCategory[def.id]!.push(Math.round(amounts[def.id] ?? 0));
    }
  }

  return sparklineByCategory;
}

async function buildYtdAmounts(
  dealershipId: string,
  month: number,
  year: number,
): Promise<{ amounts: Record<string, number>; months: number }> {
  const endMonth = month;
  const amounts: Record<string, number> = Object.fromEntries(
    CPA_EXPENSE_CATEGORY_DEFS.map((def) => [def.id, 0]),
  );

  for (let m = 1; m <= endMonth; m += 1) {
    const { start, end } = boundsForCalendarMonth(m, year);
    const { totals } = await aggregateCpaPeriod(dealershipId, start, end);
    const monthAmounts = getCategoryAmounts(totals);
    for (const def of CPA_EXPENSE_CATEGORY_DEFS) {
      amounts[def.id]! += monthAmounts[def.id] ?? 0;
    }
  }

  return { amounts, months: endMonth };
}

export async function fetchCpaExpenses(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaExpensesPageData> {
  const { view, month, year } = params;
  const bounds = resolveCpaPeriodBounds(view, month, year);
  const periodLabel = formatPeriodLabel(view, month, year);
  const comparisonLabel = formatComparisonLabel(view, month, year);

  const [current, previous, trend, sparklineByCategory, ytdData] =
    await Promise.all([
      aggregateCpaPeriod(dealershipId, bounds.start, bounds.end),
      aggregateCpaPeriod(dealershipId, bounds.prevStart, bounds.prevEnd),
      buildYearTrend(dealershipId, year),
      buildSparklines(dealershipId, month, year),
      buildYtdAmounts(dealershipId, view === "yearly" ? 12 : month, year),
    ]);

  const currentAmounts = getCategoryAmounts(current.totals);
  const previousAmounts = getCategoryAmounts(previous.totals);
  const breakdownTotal = sumCategoryAmounts(current.totals);

  const categories = buildCategoryRows({
    currentAmounts,
    previousAmounts,
    ytdAmounts: ytdData.amounts,
    sparklineByCategory,
    total: breakdownTotal,
    ytdMonths: ytdData.months,
  });

  const ytdTotal = Object.values(ytdData.amounts).reduce((sum, n) => sum + n, 0);

  const dataAsOf = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    periodLabel,
    comparisonLabel,
    dataAsOf,
    view,
    year,
    kpis: buildKpis({
      totalExpenses: breakdownTotal,
      totalExpensesPrev: sumCategoryAmounts(previous.totals),
      totalRevenue: current.totals.total_revenue,
      ytdTotal,
      ytdMonths: ytdData.months,
      categories,
      comparisonLabel,
    }),
    categories,
    breakdownTotal,
    trend,
    categoryOptions: CPA_EXPENSE_CATEGORY_DEFS.map((c) => c.label),
  };
}
