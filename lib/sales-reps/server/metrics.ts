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

/** Deal jacket row mapped for sales rep metrics (canonical sales source). */
export type RawJacket = {
  date_sold: string;
  sales_rep_id: string | null;
  created_by: string | null;
  sold_price: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
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
  commission_rate?: number | null;
  monthly_goal?: number | null;
  image_url?: string | null;
  phone?: string | null;
};

export function getCommissionRate(user: RawUser): number {
  const rate = Number(user.commission_rate);
  return Number.isFinite(rate) && rate >= 0 ? rate : COMMISSION_RATE;
}

export function resolveRepId(deal: RawDeal): string | null {
  return deal.sales_rep_id ?? deal.created_by;
}

export function resolveJacketRepId(jacket: RawJacket): string | null {
  return jacket.sales_rep_id ?? jacket.created_by;
}

export function sumJacketMetrics(
  jackets: RawJacket[],
): Omit<PeriodMetrics, "conversionRate"> {
  let grossProfit = 0;
  let netProfit = 0;
  let totalSales = 0;
  let commission = 0;

  for (const j of jackets) {
    grossProfit += Number(j.profit_gross ?? 0);
    netProfit += Number(j.profit_net ?? 0);
    totalSales += Number(j.sold_price ?? 0);
    commission += Number(j.commission_amount ?? 0);
  }

  const units = jackets.length;
  const avgGross = units > 0 ? grossProfit / units : 0;

  return { units, grossProfit, netProfit, totalSales, avgGross, commission };
}

export function computeCommissionForJackets(jackets: RawJacket[]): number {
  return jackets.reduce((sum, j) => sum + Number(j.commission_amount ?? 0), 0);
}

export function sumDealMetrics(
  deals: RawDeal[],
  commissionRate: number = COMMISSION_RATE,
): Omit<PeriodMetrics, "conversionRate"> {
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
  const commission = grossProfit * commissionRate;

  return { units, grossProfit, netProfit, totalSales, avgGross, commission };
}

export function computeCommissionForDeals(
  deals: RawDeal[],
  users: RawUser[],
): number {
  const rateByRep = new Map(users.map((u) => [u.id, getCommissionRate(u)]));
  let total = 0;

  for (const deal of deals) {
    const repId = resolveRepId(deal);
    if (!repId) continue;
    const rate = rateByRep.get(repId) ?? COMMISSION_RATE;
    const invested = Number(deal.total_invested ?? 0);
    const price = Number(deal.total_price_otd ?? 0);
    total += (price - invested) * rate;
  }

  return total;
}

export function computeConversionRate(
  repId: string,
  periodDeals: RawDeal[],
  customers: RawCustomer[],
): number {
  return computeConversionRateFromUnits(repId, periodDeals.length, customers);
}

export function computeConversionRateFromUnits(
  repId: string,
  closedUnits: number,
  customers: RawCustomer[],
): number {
  const assigned = customers.filter((c) => c.sales_rep_id === repId).length;

  if (assigned > 0) {
    return Math.min(100, (closedUnits / assigned) * 100);
  }

  return closedUnits > 0 ? Math.min(100, closedUnits * 10) : 0;
}

export type PeriodMetrics = {
  units: number;
  grossProfit: number;
  netProfit: number;
  totalSales: number;
  avgGross: number;
  commission: number;
  conversionRate: number;
};

export function computeGoalAmount(
  repDeals: RawDeal[],
  periodSales: number,
  now: Date,
  storedMonthlyGoal?: number | null,
): number {
  const stored = Number(storedMonthlyGoal ?? 0);
  if (stored > 0) {
    return Math.round(stored);
  }

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

export function buildRepListItemFromJackets(
  user: RawUser,
  allRepJackets: RawJacket[],
  customers: RawCustomer[],
  period: DateRange,
  comparison: DateRange,
  now: Date,
): SalesRepListItem {
  const periodJackets = allRepJackets.filter((j) =>
    inRange(j.date_sold, period.start, period.end),
  );
  const comparisonJackets = allRepJackets.filter((j) =>
    inRange(j.date_sold, comparison.start, comparison.end),
  );

  const current = sumJacketMetrics(periodJackets);
  const previous = sumJacketMetrics(comparisonJackets);

  const conversionRate = computeConversionRateFromUnits(
    user.id,
    periodJackets.length,
    customers,
  );
  const prevConversion = computeConversionRateFromUnits(
    user.id,
    comparisonJackets.length,
    customers,
  );

  const goalAmount = computeGoalAmount(
    allRepJackets.map((j) => ({
      sale_date: j.date_sold,
      total_price_otd: j.sold_price,
      total_collected: j.sold_price,
      created_by: j.created_by ?? "",
      sales_rep_id: j.sales_rep_id,
      total_invested: j.total_invested,
    })),
    current.totalSales,
    now,
    user.monthly_goal,
  );
  const goalProgress =
    goalAmount > 0 ? Math.round((current.totalSales / goalAmount) * 100) : 0;

  const trendKeys = getTrendMonthKeys(5, now);
  const unitsTrend = trendKeys.map((key) =>
    allRepJackets.filter((j) => monthKey(j.date_sold) === key).length,
  );
  const grossTrend = trendKeys.map((key) =>
    sumJacketMetrics(allRepJackets.filter((j) => monthKey(j.date_sold) === key)).grossProfit,
  );
  const salesTrend = trendKeys.map((key) =>
    sumJacketMetrics(allRepJackets.filter((j) => monthKey(j.date_sold) === key)).totalSales,
  );
  const netTrend = trendKeys.map((key) =>
    sumJacketMetrics(allRepJackets.filter((j) => monthKey(j.date_sold) === key)).netProfit,
  );
  const avgTrend = trendKeys.map((key) => {
    const metrics = sumJacketMetrics(
      allRepJackets.filter((j) => monthKey(j.date_sold) === key),
    );
    return metrics.avgGross;
  });
  const convTrend = trendKeys.map((_, i) => {
    const key = trendKeys[i];
    const monthJackets = allRepJackets.filter((j) => monthKey(j.date_sold) === key);
    return computeConversionRateFromUnits(user.id, monthJackets.length, customers);
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
    phone: user.phone ?? "",
    imageUrl: user.image_url ?? null,
    isActive: user.is_active,
    commissionRate: getCommissionRate(user) * 100,
    monthlyGoal: Number(user.monthly_goal ?? DEFAULT_MONTHLY_GOAL),
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

  const commissionRate = getCommissionRate(user);
  const current = sumDealMetrics(periodDeals, commissionRate);
  const previous = sumDealMetrics(comparisonDeals, commissionRate);

  const conversionRate = computeConversionRate(user.id, periodDeals, customers);
  const prevConversion = computeConversionRate(
    user.id,
    comparisonDeals,
    customers,
  );

  const goalAmount = computeGoalAmount(
    allRepDeals,
    current.totalSales,
    now,
    user.monthly_goal,
  );
  const goalProgress =
    goalAmount > 0 ? Math.round((current.totalSales / goalAmount) * 100) : 0;

  const trendKeys = getTrendMonthKeys(5, now);
  const unitsTrend = trendKeys.map((key) =>
    allRepDeals.filter((d) => monthKey(d.sale_date) === key).length,
  );
  const grossTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
      commissionRate,
    ).grossProfit,
  );
  const salesTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
      commissionRate,
    ).totalSales,
  );
  const netTrend = trendKeys.map((key) =>
    sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
      commissionRate,
    ).netProfit,
  );
  const avgTrend = trendKeys.map((key) => {
    const metrics = sumDealMetrics(
      allRepDeals.filter((d) => monthKey(d.sale_date) === key),
      commissionRate,
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
    phone: user.phone ?? "",
    imageUrl: user.image_url ?? null,
    isActive: user.is_active,
    commissionRate: getCommissionRate(user) * 100,
    monthlyGoal: Number(user.monthly_goal ?? DEFAULT_MONTHLY_GOAL),
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
