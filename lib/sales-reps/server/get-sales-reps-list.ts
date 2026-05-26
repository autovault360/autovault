import { createClient } from "@/lib/supabase/server";
import type { SalesRepListItem, SalesRepPerformanceStatus } from "../types";
import {
  buildSparkPoints,
  formatMetricDelta,
} from "../types";
import { authenticateUser } from "./utils";

const COMMISSION_RATE = 0.1;
const DEFAULT_MONTHLY_GOAL = 50000;

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
};

type DealRow = {
  sale_date: string;
  total_price_otd: number;
  total_collected: number;
  customer: { sales_rep_id: string | null } | { sales_rep_id: string | null }[] | null;
  vehicle: { total_invested: number } | { total_invested: number }[] | null;
};

type CustomerRow = {
  sales_rep_id: string | null;
  status: string;
};

function unwrapJoin<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function deriveStatus(progress: number): SalesRepPerformanceStatus {
  if (progress >= 100) return "top_performer";
  if (progress >= 75) return "on_track";
  if (progress >= 50) return "needs_attention";
  return "below_target";
}

function getDemoSalesReps(): SalesRepListItem[] {
  return [
    {
      id: "demo-1",
      fullName: "Mike Thompson",
      email: "mike.thompson@autovault360.com",
      isActive: true,
      unitsSold: 14,
      unitsSoldDelta: "↑ 12.5%",
      unitsSoldDeltaColor: "green",
      unitsSoldSparkPoints: "0,36 55,28 110,24 165,18 220,10",
      grossProfit: 48200,
      grossProfitDelta: "↑ 15.2%",
      grossProfitDeltaColor: "green",
      grossProfitSparkPoints: "0,40 55,30 110,26 165,18 220,8",
      netProfit: 42100,
      netProfitDelta: "↑ 14.1%",
      netProfitDeltaColor: "green",
      netProfitSparkPoints: "0,38 55,32 110,28 165,20 220,12",
      totalSales: 198400,
      totalSalesDelta: "↑ 11.8%",
      totalSalesDeltaColor: "green",
      totalSalesSparkPoints: "0,40 55,34 110,28 165,22 220,14",
      avgGrossPerUnit: 3443,
      avgGrossDelta: "↑ 8.4%",
      avgGrossDeltaColor: "green",
      avgGrossSparkPoints: "0,34 55,28 110,26 165,20 220,16",
      conversionRate: 68.5,
      conversionDelta: "↑ 5.2%",
      conversionDeltaColor: "green",
      conversionSparkPoints: "0,42 55,34 110,28 165,22 220,14",
      goalAmount: 50000,
      goalProgress: 112,
      status: "top_performer",
    },
    {
      id: "demo-2",
      fullName: "Sarah Williams",
      email: "sarah.williams@autovault360.com",
      isActive: true,
      unitsSold: 11,
      unitsSoldDelta: "↑ 8.3%",
      unitsSoldDeltaColor: "green",
      unitsSoldSparkPoints: "0,38 55,32 110,28 165,22 220,16",
      grossProfit: 36800,
      grossProfitDelta: "↑ 9.7%",
      grossProfitDeltaColor: "green",
      grossProfitSparkPoints: "0,40 55,34 110,30 165,24 220,18",
      netProfit: 31200,
      netProfitDelta: "↑ 8.1%",
      netProfitDeltaColor: "green",
      netProfitSparkPoints: "0,36 55,30 110,26 165,20 220,14",
      totalSales: 156200,
      totalSalesDelta: "↑ 7.4%",
      totalSalesDeltaColor: "green",
      totalSalesSparkPoints: "0,42 55,36 110,30 165,24 220,18",
      avgGrossPerUnit: 3345,
      avgGrossDelta: "↑ 4.2%",
      avgGrossDeltaColor: "green",
      avgGrossSparkPoints: "0,40 55,34 110,30 165,26 220,20",
      conversionRate: 61.2,
      conversionDelta: "↑ 3.1%",
      conversionDeltaColor: "green",
      conversionSparkPoints: "0,44 55,38 110,32 165,26 220,20",
      goalAmount: 45000,
      goalProgress: 92,
      status: "on_track",
    },
    {
      id: "demo-3",
      fullName: "James Rodriguez",
      email: "james.r@autovault360.com",
      isActive: true,
      unitsSold: 9,
      unitsSoldDelta: "↑ 5.6%",
      unitsSoldDeltaColor: "green",
      unitsSoldSparkPoints: "0,40 55,36 110,32 165,28 220,22",
      grossProfit: 29400,
      grossProfitDelta: "↑ 6.8%",
      grossProfitDeltaColor: "green",
      grossProfitSparkPoints: "0,42 55,38 110,34 165,28 220,22",
      netProfit: 24800,
      netProfitDelta: "↑ 5.9%",
      netProfitDeltaColor: "green",
      netProfitSparkPoints: "0,38 55,34 110,30 165,26 220,20",
      totalSales: 128600,
      totalSalesDelta: "↑ 4.2%",
      totalSalesDeltaColor: "green",
      totalSalesSparkPoints: "0,44 55,40 110,34 165,28 220,22",
      avgGrossPerUnit: 3267,
      avgGrossDelta: "↑ 2.8%",
      avgGrossDeltaColor: "green",
      avgGrossSparkPoints: "0,42 55,38 110,34 165,30 220,24",
      conversionRate: 54.8,
      conversionDelta: "↓ 1.2%",
      conversionDeltaColor: "red",
      conversionSparkPoints: "0,20 55,28 110,32 165,36 220,40",
      goalAmount: 40000,
      goalProgress: 78,
      status: "on_track",
    },
    {
      id: "demo-4",
      fullName: "Emily Chen",
      email: "emily.chen@autovault360.com",
      isActive: true,
      unitsSold: 7,
      unitsSoldDelta: "↓ 2.1%",
      unitsSoldDeltaColor: "red",
      unitsSoldSparkPoints: "0,18 55,26 110,30 165,34 220,38",
      grossProfit: 22100,
      grossProfitDelta: "↓ 3.4%",
      grossProfitDeltaColor: "red",
      grossProfitSparkPoints: "0,16 55,24 110,28 165,32 220,36",
      netProfit: 18400,
      netProfitDelta: "↓ 2.8%",
      netProfitDeltaColor: "red",
      netProfitSparkPoints: "0,20 55,28 110,32 165,36 220,38",
      totalSales: 98400,
      totalSalesDelta: "↓ 1.9%",
      totalSalesDeltaColor: "red",
      totalSalesSparkPoints: "0,18 55,26 110,30 165,34 220,36",
      avgGrossPerUnit: 3157,
      avgGrossDelta: "↓ 1.5%",
      avgGrossDeltaColor: "red",
      avgGrossSparkPoints: "0,22 55,28 110,32 165,36 220,38",
      conversionRate: 48.3,
      conversionDelta: "↓ 4.6%",
      conversionDeltaColor: "red",
      conversionSparkPoints: "0,14 55,22 110,28 165,34 220,40",
      goalAmount: 38000,
      goalProgress: 58,
      status: "needs_attention",
    },
    {
      id: "demo-5",
      fullName: "David Martinez",
      email: "david.m@autovault360.com",
      isActive: true,
      unitsSold: 5,
      unitsSoldDelta: "↓ 8.2%",
      unitsSoldDeltaColor: "red",
      unitsSoldSparkPoints: "0,12 55,20 110,26 165,32 220,38",
      grossProfit: 15200,
      grossProfitDelta: "↓ 9.1%",
      grossProfitDeltaColor: "red",
      grossProfitSparkPoints: "0,10 55,18 110,24 165,30 220,36",
      netProfit: 12100,
      netProfitDelta: "↓ 7.6%",
      netProfitDeltaColor: "red",
      netProfitSparkPoints: "0,14 55,22 110,28 165,34 220,38",
      totalSales: 72400,
      totalSalesDelta: "↓ 6.4%",
      totalSalesDeltaColor: "red",
      totalSalesSparkPoints: "0,12 55,20 110,26 165,32 220,38",
      avgGrossPerUnit: 3040,
      avgGrossDelta: "↓ 3.2%",
      avgGrossDeltaColor: "red",
      avgGrossSparkPoints: "0,16 55,24 110,28 165,34 220,38",
      conversionRate: 38.6,
      conversionDelta: "↓ 6.8%",
      conversionDeltaColor: "red",
      conversionSparkPoints: "0,10 55,18 110,24 165,32 220,42",
      goalAmount: 35000,
      goalProgress: 42,
      status: "below_target",
    },
    {
      id: "demo-6",
      fullName: "Lisa Anderson",
      email: "lisa.a@autovault360.com",
      isActive: true,
      unitsSold: 4,
      unitsSoldDelta: "↓ 11.4%",
      unitsSoldDeltaColor: "red",
      unitsSoldSparkPoints: "0,8 55,16 110,22 165,30 220,40",
      grossProfit: 11800,
      grossProfitDelta: "↓ 12.3%",
      grossProfitDeltaColor: "red",
      grossProfitSparkPoints: "0,8 55,14 110,20 165,28 220,38",
      netProfit: 9400,
      netProfitDelta: "↓ 10.8%",
      netProfitDeltaColor: "red",
      netProfitSparkPoints: "0,10 55,18 110,24 165,32 220,40",
      totalSales: 58200,
      totalSalesDelta: "↓ 9.7%",
      totalSalesDeltaColor: "red",
      totalSalesSparkPoints: "0,8 55,16 110,22 165,30 220,40",
      avgGrossPerUnit: 2950,
      avgGrossDelta: "↓ 4.8%",
      avgGrossDeltaColor: "red",
      avgGrossSparkPoints: "0,12 55,20 110,26 165,32 220,38",
      conversionRate: 32.1,
      conversionDelta: "↓ 8.4%",
      conversionDeltaColor: "red",
      conversionSparkPoints: "0,8 55,14 110,20 165,28 220,42",
      goalAmount: 32000,
      goalProgress: 35,
      status: "below_target",
    },
  ];
}

export async function getSalesRepsList(): Promise<SalesRepListItem[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return getDemoSalesReps();

  const supabase = await createClient();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, full_name, email, is_active")
    .eq("dealership_id", auth.user.dealershipId)
    .in("role", ["owner", "manager", "sales_rep"])
    .order("full_name");

  if (usersError) {
    console.warn("getSalesRepsList users:", usersError.message);
    return getDemoSalesReps();
  }

  if (!users || users.length === 0) {
    return getDemoSalesReps();
  }

  const { data: deals } = await supabase
    .from("deals")
    .select(
      `
      sale_date, total_price_otd, total_collected,
      customer:customers!inner(sales_rep_id),
      vehicle:vehicles(total_invested)
    `,
    )
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  const { data: customers } = await supabase
    .from("customers")
    .select("sales_rep_id, status")
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  const dealRows = (deals ?? []) as unknown as DealRow[];
  const customerRows = (customers ?? []) as CustomerRow[];

  return (users as UserRow[]).map((user) => {
    const repDeals = dealRows.filter((deal) => {
      const customer = unwrapJoin(deal.customer);
      return customer?.sales_rep_id === user.id;
    });

    const currentDeals = repDeals.filter(
      (d) => monthKey(d.sale_date) === currentMonth,
    );
    const previousDeals = repDeals.filter(
      (d) => monthKey(d.sale_date) === previousMonth,
    );

    const sumMetrics = (rows: DealRow[]) => {
      let grossProfit = 0;
      let totalSales = 0;
      for (const deal of rows) {
        const vehicle = unwrapJoin(deal.vehicle);
        const invested = Number(vehicle?.total_invested ?? 0);
        const price = Number(deal.total_price_otd ?? 0);
        grossProfit += price - invested;
        totalSales += Number(deal.total_collected ?? 0);
      }
      const units = rows.length;
      const avgGross = units > 0 ? grossProfit / units : 0;
      const netProfit = grossProfit * 0.875;
      return { units, grossProfit, netProfit, totalSales, avgGross };
    };

    const current = sumMetrics(currentDeals);
    const previous = sumMetrics(previousDeals);

    const assignedCustomers = customerRows.filter(
      (c) => c.sales_rep_id === user.id,
    );
    const convertedCustomers = assignedCustomers.filter(
      (c) => c.status === "customer",
    );
    const conversionRate =
      assignedCustomers.length > 0
        ? (convertedCustomers.length / assignedCustomers.length) * 100
        : current.units > 0
          ? Math.min(95, 40 + current.units * 2)
          : 0;

    const prevConversion =
      previous.units > 0
        ? Math.max(0, conversionRate - 5)
        : conversionRate * 0.9;

    const goalAmount = DEFAULT_MONTHLY_GOAL;
    const goalProgress =
      goalAmount > 0 ? Math.round((current.totalSales / goalAmount) * 100) : 0;

    const monthlyTrend = Array.from({ length: 5 }, (_, i) => {
      const monthDeals = repDeals.filter((d) => {
        const key = monthKey(d.sale_date);
        const target = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
        return key === targetKey;
      });
      return sumMetrics(monthDeals).units;
    });

    const grossTrend = Array.from({ length: 5 }, (_, i) => {
      const monthDeals = repDeals.filter((d) => {
        const key = monthKey(d.sale_date);
        const target = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
        return key === targetKey;
      });
      return sumMetrics(monthDeals).grossProfit;
    });

    const salesTrend = Array.from({ length: 5 }, (_, i) => {
      const monthDeals = repDeals.filter((d) => {
        const key = monthKey(d.sale_date);
        const target = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
        return key === targetKey;
      });
      return sumMetrics(monthDeals).totalSales;
    });

    const unitsDelta = formatMetricDelta(current.units, previous.units);
    const grossDelta = formatMetricDelta(current.grossProfit, previous.grossProfit);
    const netDelta = formatMetricDelta(current.netProfit, previous.netProfit);
    const salesDelta = formatMetricDelta(current.totalSales, previous.totalSales);
    const avgDelta = formatMetricDelta(current.avgGross, previous.avgGross);
    const convDelta = formatMetricDelta(conversionRate, prevConversion);

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      isActive: user.is_active,
      unitsSold: current.units,
      unitsSoldDelta: unitsDelta.text,
      unitsSoldDeltaColor: unitsDelta.color,
      unitsSoldSparkPoints: buildSparkPoints(monthlyTrend),
      grossProfit: current.grossProfit,
      grossProfitDelta: grossDelta.text,
      grossProfitDeltaColor: grossDelta.color,
      grossProfitSparkPoints: buildSparkPoints(grossTrend),
      netProfit: current.netProfit,
      netProfitDelta: netDelta.text,
      netProfitDeltaColor: netDelta.color,
      netProfitSparkPoints: buildSparkPoints(
        grossTrend.map((v) => v * 0.875),
      ),
      totalSales: current.totalSales,
      totalSalesDelta: salesDelta.text,
      totalSalesDeltaColor: salesDelta.color,
      totalSalesSparkPoints: buildSparkPoints(salesTrend),
      avgGrossPerUnit: current.avgGross,
      avgGrossDelta: avgDelta.text,
      avgGrossDeltaColor: avgDelta.color,
      avgGrossSparkPoints: buildSparkPoints(
        grossTrend.map((v, _, arr) => (arr.length ? v / Math.max(current.units, 1) : 0)),
      ),
      conversionRate,
      conversionDelta: convDelta.text,
      conversionDeltaColor: convDelta.color,
      conversionSparkPoints: buildSparkPoints([
        prevConversion * 0.9,
        prevConversion * 0.95,
        prevConversion,
        conversionRate * 0.95,
        conversionRate,
      ]),
      goalAmount,
      goalProgress,
      status: deriveStatus(goalProgress),
    };
  });
}

export { getDemoSalesReps };
