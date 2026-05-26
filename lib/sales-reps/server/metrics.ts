import type { SalesRepListItem, SalesRepPerformanceStatus } from "../types";
import {
  buildSparkPoints,
  formatMetricDelta,
} from "../types";
import {
  getTrendMonthKeys,
  inRange,
  monthKey,
  type DateRange,
} from "./date-ranges";

export const COMMISSION_RATE = 0.1;
export const DEFAULT_MONTHLY_GOAL = 50000;

export type RawDeal = {
  sale_date: string;
  total_price_otd: number;
  total_collected: number;
  created_by: string;
  sales_rep_id: string | null;
  total_invested: number;
};

export type RawCustomer = {
  sales_rep_id: string | null;
  status: string;
  created_at: string;
};

export type RawUser = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
};

export type PeriodMetrics = {
  units: number;
  grossProfit: number;
  netProfit: number;
  totalSales: number;
  avgGross: number;
  commission: number;
  conversionRate: number;
};

export function resolveRepId(deal: RawDeal): string | null {
  return deal.sales_rep_id ?? deal.created_by;
}

export function sumDealMetrics(deals: RawDeal[]): Omit<PeriodMetrics, "conversionRate"> {
  let grossProfit = 0;
  let netProfit = 0;
  let totalSales = 0;

  for (const deal of deals) {
    const invested = Number(deal.total_invested ?? 0);
    const price = Number(deal.total_price_otd ?? 0);
    const collected = Number(deal.total_collected ?? 0);
    grossProfit += price - invested;
    netProfit += collected - invested;
    totalSales += collected;
  }

  const units = deals.length;
  const avgGross = units > 0 ? grossProfit / units : 0;
  const commission = grossProfit * COMMISSION_RATE;

  return { units, grossProfit, netProfit, totalSales, avgGross, commission };
}

export function computeConversionRate(
  repId: string,
  periodDeals: RawDeal[],
  customers: RawCustomer[],
): number {
  const assigned = customers.filter((c) => c.sales_rep_id === repId).length;
  const closed = periodDeals.length;

  if (assigned > 0) {
    return Math.min(100, (closed / assigned) * 100);
  }

  return closed > 0 ? Math.min(100, closed * 10) : 0;
}

export function computeGoalAmount(
  repDeals: RawDeal[],
  periodSales: number,
  now: Date,
): number {
  const trendKeys = getTrendMonthKeys(3, now);
  const monthlySales = trendKeys.map((key) =>
    repDeals
      .filter((d) => monthKey(d.sale_date) === key)
      .reduce((sum, d) => sum + Number(d.total_collected ?? 0), 0),
  );
  const avg =
    monthlySales.reduce((sum, v) => sum + v, 0) /
    Math.max(monthlySales.filter((v) => v > 0).length, 1);

  if (avg > 0) {
    return Math.round(avg * 1.1);
  }

  return periodSales > 0
    ? Math.max(DEFAULT_MONTHLY_GOAL, Math.round(periodSales * 1.2))
    : DEFAULT_MONTHLY_GOAL;
}

export function deriveStatus(progress: number): SalesRepPerformanceStatus {
  if (progress >= 100) return "top_performer";
  if (progress >= 75) return "on_track";
  if (progress >= 50) return "needs_attention";
  return "below_target";
}

export function buildRepListItem(
  user: RawUser,
  allRepDeals: RawDeal[],
  customers: RawCustomer[],
  period: DateRange,
  comparison: DateRange,
  now: Date,
): SalesRepListItem {
  const periodDeals = allRepDeals.filter((d) =>
    inRange(d.sale_date, period.start, period.end),
  );
  const comparisonDeals = allRepDeals.filter((d) =>
    inRange(d.sale_date, comparison.start, comparison.end),
  );

  const current = sumDealMetrics(periodDeals);
  const previous = sumDealMetrics(comparisonDeals);

  const conversionRate = computeConversionRate(user.id, periodDeals, customers);
  const prevConversion = computeConversionRate(
    user.id,
    comparisonDeals,
    customers,
  );

  const goalAmount = computeGoalAmount(allRepDeals, current.totalSales, now);
  const goalProgress =
    goalAmount > 0 ? Math.round((current.totalSales / goalAmount) * 100) : 0;

  const trendKeys = getTrendMonthKeys(5, now);
  const unitsTrend = trendKeys.map((key) =>
    allRepDeals.filter((d) => monthKey(d.sale_date) === key).length,
  );
  const grossTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
    ).grossProfit,
  );
  const salesTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
    ).totalSales,
  );
  const netTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
    ).netProfit,
  );
  const avgTrend = trendKeys.map((key) => {
    const metrics = sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
    );
    return metrics.avgGross;
  });
  const convTrend = trendKeys.map((_, i) => {
    const key = trendKeys[i];
    const monthDeals = allRepDeals.filter((d) => monthKey(d.sale_date) === key);
    return computeConversionRate(user.id, monthDeals, customers);
  });

  const unitsDelta = formatMetricDelta(current.units, previous.units, comparison.label);
  const grossDelta = formatMetricDelta(
    current.grossProfit,
    previous.grossProfit,
    comparison.label,
  );
  const netDelta = formatMetricDelta(
    current.netProfit,
    previous.netProfit,
    comparison.label,
  );
  const salesDelta = formatMetricDelta(
    current.totalSales,
    previous.totalSales,
    comparison.label,
  );
  const avgDelta = formatMetricDelta(current.avgGross, previous.avgGross, comparison.label);
  const convDelta = formatMetricDelta(conversionRate, prevConversion, comparison.label);

  return {
    id: user.id,
    fullName: user.full_name || "Unknown",
    email: user.email,
    isActive: user.is_active,
    unitsSold: current.units,
    unitsSoldDelta: unitsDelta.text,
    unitsSoldDeltaColor: unitsDelta.color,
    unitsSoldSparkPoints: buildSparkPoints(unitsTrend),
    grossProfit: current.grossProfit,
    grossProfitDelta: grossDelta.text,
    grossProfitDeltaColor: grossDelta.color,
    grossProfitSparkPoints: buildSparkPoints(grossTrend),
    netProfit: current.netProfit,
    netProfitDelta: netDelta.text,
    netProfitDeltaColor: netDelta.color,
    netProfitSparkPoints: buildSparkPoints(netTrend),
    totalSales: current.totalSales,
    totalSalesDelta: salesDelta.text,
    totalSalesDeltaColor: salesDelta.color,
    totalSalesSparkPoints: buildSparkPoints(salesTrend),
    avgGrossPerUnit: current.avgGross,
    avgGrossDelta: avgDelta.text,
    avgGrossDeltaColor: avgDelta.color,
    avgGrossSparkPoints: buildSparkPoints(avgTrend),
    conversionRate,
    conversionDelta: convDelta.text,
    conversionDeltaColor: convDelta.color,
    conversionSparkPoints: buildSparkPoints(convTrend),
    goalAmount,
    goalProgress,
    status: deriveStatus(goalProgress),
  };
}
