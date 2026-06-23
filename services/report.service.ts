import { createClient } from "@/lib/supabase/server";
import type { KPICardData } from "@/components/ui/kpi-card";
import {
  getVehicleCount,
  getTopVehiclesByProfit,
  getInventoryAging,
  getInventoryValue,
  getVehiclesByStatus,
  type TopVehicle,
  type InventoryAgingBracket,
} from "./vehicle.service";
import {
  fetchJacketsInRange,
  fetchJacketsInRangeExtended,
  getDealAggregates,
  getRecentDeals,
  getDealJacketStatusCounts,
  type RecentDeal,
  type DealAggregates,
} from "./deal-jacket.service";
import {
  getExpensesByCategory,
  getExpenseTotals,
  type CategoryExpense,
} from "./expense.service";
import type { SalesRepRow } from "@/lib/reports-reminders/types";

export type DashboardKpis = {
  totalInventory: KPICardData;
  soldThisMonth: KPICardData;
  grossProfitMtd: KPICardData;
  netProfitMtd: KPICardData;
  monthlyExpenses: KPICardData;
};

export type PeriodComparison = {
  metric: string;
  lastMonth: string;
  thisMonth: string;
  change: string;
  positive: boolean;
};

export type ProfitLossOverview = {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeDelta: string;
  expenseDelta: string;
  profitDelta: string;
};

export type ExpensesPayrollOverview = {
  expenses: CategoryExpense[];
  expensesTotal: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  comparison: PeriodComparison[];
  profitLoss: ProfitLossOverview;
  expensesBreakdown: ExpensesPayrollOverview;
  recentDeals: RecentDeal[];
  topVehicles: TopVehicle[];
  inventoryAging: InventoryAgingBracket[];
  inventoryValue: number;
  dealJacketStatus: { completed: number; inProgress: number; funded: number; total: number };
};

function sparkPoints(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  return values.map((v, i) => `${i * 24},${Math.round((1 - v / max) * 40)}`).join(" ");
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function monthRange(monthsAgo: number = 0): { from: string; to: string } {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  const from = d.toISOString().slice(0, 7) + "-01";
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

function lastMonthRange(): { from: string; to: string } {
  return monthRange(1);
}

export async function getDashboardData(
  dealershipId: string,
  dealStatusFilter?: string,
  periodFrom?: string,
  periodTo?: string,
  comparisonFrom?: string,
  comparisonTo?: string,
): Promise<DashboardData> {
  const { from: mtdFrom, to: mtdTo } = periodFrom && periodTo
    ? { from: periodFrom, to: periodTo }
    : monthRange(0);
  const { from: ltdFrom, to: ltdTo } = comparisonFrom && comparisonTo
    ? { from: comparisonFrom, to: comparisonTo }
    : lastMonthRange();
  const ytdFrom = `${new Date().getFullYear()}-01-01`;
  const now = new Date().toISOString().slice(0, 10);

  const [
    totalInventory,
    soldThisMonth,
    thisMonthAgg,
    lastMonthAgg,
    mtdExpenses,
    ltdExpenses,
    recentDeals,
    topVehicles,
    inventoryAging,
    inventoryValue,
    statusCounts,
    expenseCategories,
  ] = await Promise.all([
    getVehicleCount(dealershipId),
    (
      await supabaseCount(dealershipId, "deal_jackets", mtdFrom, mtdTo)
    ),
    getDealAggregates(dealershipId, mtdFrom, mtdTo),
    getDealAggregates(dealershipId, ltdFrom, ltdTo),
    getExpenseTotals(dealershipId, mtdFrom, mtdTo),
    getExpenseTotals(dealershipId, ltdFrom, ltdTo),
    getRecentDeals(dealershipId, 5, dealStatusFilter),
    getTopVehiclesByProfit(dealershipId, 5),
    getInventoryAging(dealershipId),
    getInventoryValue(dealershipId),
    getDealJacketStatusCounts(dealershipId),
    getExpensesByCategory(dealershipId, mtdFrom, mtdTo),
  ]);

  const grossProfitDelta = lastMonthAgg.grossProfit > 0
    ? ((thisMonthAgg.grossProfit - lastMonthAgg.grossProfit) / lastMonthAgg.grossProfit * 100).toFixed(1)
    : "0";
  const netProfitDelta = lastMonthAgg.netProfit > 0
    ? ((thisMonthAgg.netProfit - lastMonthAgg.netProfit) / lastMonthAgg.netProfit * 100).toFixed(1)
    : "0";
  const expenseDelta = ltdExpenses.grandTotal > 0
    ? ((mtdExpenses.grandTotal - ltdExpenses.grandTotal) / ltdExpenses.grandTotal * 100).toFixed(1)
    : "0";

  const trendValues = await getTrendValues(dealershipId);

  const vsLastMonthPositive = (val: number) => val >= 0;

  return {
    kpis: {
      totalInventory: {
        icon: "car",
        color: "blue",
        label: "Total Inventory",
        value: String(totalInventory),
        unit: "Vehicles",
        link: "View Inventory",
        sparkColor: "#3b82f6",
        sparkPoints: sparkPoints(trendValues.inventory),
      },
      soldThisMonth: {
        icon: "tag",
        color: "green",
        label: "Sold This Month",
        value: String(soldThisMonth),
        unit: "Vehicles",
        link: "View Sales",
        sparkColor: "#10b981",
        sparkPoints: sparkPoints(trendValues.sold),
      },
      grossProfitMtd: {
        icon: "dollar-sign",
        color: "amber",
        label: "Gross Profit (MTD)",
        value: formatCurrency(thisMonthAgg.grossProfit),
        delta: `... ${grossProfitDelta}% vs last month`,
        link: "View Resales",
        sparkColor: "#22c55e",
        sparkPoints: sparkPoints(trendValues.grossProfit),
      },
      netProfitMtd: {
        icon: "pie-chart",
        color: "violet",
        label: "Net Profit (MTD)",
        value: formatCurrency(thisMonthAgg.netProfit),
        delta: `... ${netProfitDelta}% vs last month`,
        link: "View Report",
        sparkColor: "#a855f7",
        sparkPoints: sparkPoints(trendValues.netProfit),
      },
      monthlyExpenses: {
        icon: "trending-down",
        color: "red",
        label: "Monthly Expenses",
        value: formatCurrency(mtdExpenses.grandTotal),
        delta: `... ${expenseDelta}% vs last month`,
        link: "View Expenses",
        sparkColor: "#ef4444",
        sparkPoints: sparkPoints(trendValues.expenses),
      },
    },
    comparison: [
      {
        metric: "Total Sales",
        lastMonth: formatCurrency(lastMonthAgg.totalSales),
        thisMonth: formatCurrency(thisMonthAgg.totalSales),
        change: `... ${calcDeltaPct(thisMonthAgg.totalSales, lastMonthAgg.totalSales)}%`,
        positive: vsLastMonthPositive(thisMonthAgg.totalSales - lastMonthAgg.totalSales),
      },
      {
        metric: "Gross Profit",
        lastMonth: formatCurrency(lastMonthAgg.grossProfit),
        thisMonth: formatCurrency(thisMonthAgg.grossProfit),
        change: `... ${grossProfitDelta}%`,
        positive: vsLastMonthPositive(thisMonthAgg.grossProfit - lastMonthAgg.grossProfit),
      },
      {
        metric: "Net Profit",
        lastMonth: formatCurrency(lastMonthAgg.netProfit),
        thisMonth: formatCurrency(thisMonthAgg.netProfit),
        change: `... ${netProfitDelta}%`,
        positive: vsLastMonthPositive(thisMonthAgg.netProfit - lastMonthAgg.netProfit),
      },
      {
        metric: "Total Expenses",
        lastMonth: formatCurrency(ltdExpenses.grandTotal),
        thisMonth: formatCurrency(mtdExpenses.grandTotal),
        change: `... ${expenseDelta}%`,
        positive: vsLastMonthPositive(ltdExpenses.grandTotal - mtdExpenses.grandTotal),
      },
      {
        metric: "Vehicles Sold",
        lastMonth: String(lastMonthAgg.count),
        thisMonth: String(thisMonthAgg.count),
        change: `... ${calcDeltaPct(thisMonthAgg.count, lastMonthAgg.count)}%`,
        positive: vsLastMonthPositive(thisMonthAgg.count - lastMonthAgg.count),
      },
    ],
    profitLoss: {
      totalIncome: thisMonthAgg.totalSales,
      totalExpenses: mtdExpenses.grandTotal,
      netProfit: thisMonthAgg.netProfit,
      incomeDelta: `${calcDeltaPct(thisMonthAgg.totalSales, lastMonthAgg.totalSales)}%`,
      expenseDelta: `${expenseDelta}%`,
      profitDelta: `${netProfitDelta}%`,
    },
    expensesBreakdown: {
      expenses: expenseCategories,
      expensesTotal: mtdExpenses.grandTotal,
    },
    recentDeals,
    topVehicles,
    inventoryAging,
    inventoryValue,
    dealJacketStatus: {
      completed: statusCounts.completed,
      inProgress: statusCounts.inProgress,
      funded: statusCounts.funded,
      total: statusCounts.total,
    },
  };
}

async function supabaseCount(
  dealershipId: string,
  table: "deal_jackets",
  from: string,
  to: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`);

  if (error) {
    console.warn("supabaseCount:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function getTrendValues(
  dealershipId: string,
): Promise<{ inventory: number[]; sold: number[]; grossProfit: number[]; netProfit: number[]; expenses: number[] }> {
  const result = { inventory: [] as number[], sold: [] as number[], grossProfit: [] as number[], netProfit: [] as number[], expenses: [] as number[] };

  for (let i = 5; i >= 0; i--) {
    const { from, to } = monthRange(i);
    const [inv, sld, agg, exp] = await Promise.all([
      getVehicleCount(dealershipId, to),
      supabaseCount(dealershipId, "deal_jackets", from, to),
      getDealAggregates(dealershipId, from, to),
      getExpenseTotals(dealershipId, from, to),
    ]);

    result.inventory.push(inv);
    result.sold.push(sld);
    result.grossProfit.push(agg.grossProfit);
    result.netProfit.push(agg.netProfit);
    result.expenses.push(exp.grandTotal);
  }

  return result;
}

async function getSalesRepPerformance(
  dealershipId: string,
  from: string,
  to: string,
): Promise<SalesRepRow[]> {
  const supabase = await createClient();

  const { data: reps } = await supabase
    .from("users")
    .select(
      `id, full_name,
       sales_rep_profile:sales_rep_profiles(commission_rate)`,
    )
    .eq("dealership_id", dealershipId)
    .in("role", ["owner", "manager", "sales_rep"])
    .order("full_name");

  const repIds = (reps ?? []).map((r) => r.id);
  if (repIds.length === 0) return [];

  const { data: jackets } = await supabase
    .from("deal_jackets")
    .select("sales_rep_id, profit_gross, commission_amount, sold_price")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("sales_rep_id", repIds)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`);

  const jackArr = (jackets ?? []) as Array<{
    sales_rep_id: string;
    profit_gross: number;
    commission_amount: number;
    sold_price: number;
  }>;

  const repMap = new Map<string, { count: number; grossProfit: number; commission: number; totalSales: number }>();
  for (const r of reps ?? []) {
    repMap.set(r.id, { count: 0, grossProfit: 0, commission: 0, totalSales: 0 });
  }

  for (const j of jackArr) {
    const stats = repMap.get(j.sales_rep_id);
    if (stats) {
      stats.count++;
      stats.grossProfit += Number(j.profit_gross ?? 0);
      stats.commission += Number(j.commission_amount ?? 0);
      stats.totalSales += Number(j.sold_price ?? 0);
    }
  }

  const sorted = [...repMap.entries()]
    .map(([id, stats]) => ({
      id,
      name: (reps ?? []).find((r) => r.id === id)?.full_name ?? "Unknown",
      ...stats,
    }))
    .sort((a, b) => b.grossProfit - a.grossProfit);

  return sorted.slice(0, 5).map((s, i) => ({
    rank: i + 1,
    name: s.name,
    carsSold: s.count,
    grossProfit: formatCurrency(s.grossProfit),
    commission: formatCurrency(s.commission),
    closingRatio: s.count > 0 && s.totalSales > 0
      ? `${Math.round((s.grossProfit / s.totalSales) * 100)}%`
      : "0%",
  }));
}

function calcDeltaPct(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0" : "100";
  return ((current - previous) / Math.abs(previous) * 100).toFixed(1);
}
