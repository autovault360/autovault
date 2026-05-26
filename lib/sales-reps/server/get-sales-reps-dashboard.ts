import { createClient } from "@/lib/supabase/server";
import type {
  SalesRepDashboardData,
  SalesRepPeriod,
  SalesRepStats,
} from "../types";
import { buildSparkPoints, formatMetricDelta } from "../types";
import {
  getComparisonRange,
  getPeriodRange,
  getTrendMonthKeys,
  inRange,
  monthEnd,
  monthKey,
  monthStart,
  yearStart,
} from "./date-ranges";
import {
  buildRepListItem,
  COMMISSION_RATE,
  resolveRepId,
  sumDealMetrics,
  type RawCustomer,
  type RawDeal,
  type RawUser,
} from "./metrics";
import { authenticateUser } from "./utils";

type DealRow = {
  sale_date: string;
  total_price_otd: number;
  total_collected: number;
  created_by: string;
  customer: { sales_rep_id: string | null } | { sales_rep_id: string | null }[] | null;
  vehicle: { total_invested: number } | { total_invested: number }[] | null;
};

function unwrapJoin<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function emptyStats(): SalesRepStats {
  return {
    totalReps: 0,
    activeReps: 0,
    commissionsPaidMtd: 0,
    commissionsPaidMtdDelta: "0% vs last month",
    commissionsPaidMtdDeltaColor: "green",
    commissionsPaidMtdSparkPoints: buildSparkPoints([]),
    totalCommissionsYtd: 0,
    totalCommissionsYtdDelta: "0% vs last year",
    totalCommissionsYtdDeltaColor: "green",
    totalCommissionsYtdSparkPoints: buildSparkPoints([]),
  };
}

function mapDealRow(row: DealRow): RawDeal {
  const customer = unwrapJoin(row.customer);
  const vehicle = unwrapJoin(row.vehicle);
  return {
    sale_date: row.sale_date,
    total_price_otd: Number(row.total_price_otd ?? 0),
    total_collected: Number(row.total_collected ?? 0),
    created_by: row.created_by,
    sales_rep_id: customer?.sales_rep_id ?? null,
    total_invested: Number(vehicle?.total_invested ?? 0),
  };
}

function computeStatsFromDeals(
  deals: RawDeal[],
  users: RawUser[],
  now: Date,
): SalesRepStats {
  const repIds = new Set(users.map((u) => u.id));
  const repDeals = deals.filter((d) => {
    const repId = resolveRepId(d);
    return repId != null && repIds.has(repId);
  });

  const mtdStart = monthStart(now);
  const mtdEnd = monthEnd(now);
  const prevMtdStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevMtdEnd = monthEnd(prevMtdStart);

  const mtdDeals = repDeals.filter((d) => inRange(d.sale_date, mtdStart, mtdEnd));
  const prevMtdDeals = repDeals.filter((d) =>
    inRange(d.sale_date, prevMtdStart, prevMtdEnd),
  );

  const ytdStart = yearStart(now);
  const ytdDeals = repDeals.filter((d) => inRange(d.sale_date, ytdStart, now));
  const prevYtdStart = yearStart(new Date(now.getFullYear() - 1, 0, 1));
  const prevYtdEnd = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  const prevYtdDeals = repDeals.filter((d) =>
    inRange(d.sale_date, prevYtdStart, prevYtdEnd),
  );

  const commissionsPaidMtd = sumDealMetrics(mtdDeals).commission;
  const commissionsPaidPrevMtd = sumDealMetrics(prevMtdDeals).commission;
  const totalCommissionsYtd = sumDealMetrics(ytdDeals).commission;
  const totalCommissionsPrevYtd = sumDealMetrics(prevYtdDeals).commission;

  const mtdDelta = formatMetricDelta(
    commissionsPaidMtd,
    commissionsPaidPrevMtd,
    "last month",
  );
  const ytdDelta = formatMetricDelta(
    totalCommissionsYtd,
    totalCommissionsPrevYtd,
    "last year",
  );

  const trendKeys = getTrendMonthKeys(5, now);
  const commissionTrend = trendKeys.map((key) =>
    sumDealMetrics(
      repDeals.filter((d) => monthKey(d.sale_date) === key),
    ).commission,
  );

  return {
    totalReps: users.length,
    activeReps: users.filter((u) => u.is_active).length,
    commissionsPaidMtd,
    commissionsPaidMtdDelta: mtdDelta.text,
    commissionsPaidMtdDeltaColor: mtdDelta.color,
    commissionsPaidMtdSparkPoints: buildSparkPoints(commissionTrend),
    totalCommissionsYtd,
    totalCommissionsYtdDelta: ytdDelta.text,
    totalCommissionsYtdDeltaColor: ytdDelta.color,
    totalCommissionsYtdSparkPoints: buildSparkPoints(commissionTrend),
  };
}

async function fetchDashboardRaw(dealershipId: string) {
  const supabase = await createClient();

  const [usersResult, dealsResult, customersResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name, email, is_active")
      .eq("dealership_id", dealershipId)
      .in("role", ["owner", "manager", "sales_rep"])
      .order("full_name"),
    supabase
      .from("deals")
      .select(
        `
        sale_date, total_price_otd, total_collected, created_by,
        customer:customers(sales_rep_id),
        vehicle:vehicles(total_invested)
      `,
      )
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null),
    supabase
      .from("customers")
      .select("sales_rep_id, status, created_at")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null),
  ]);

  return {
    users: (usersResult.data ?? []) as RawUser[],
    usersError: usersResult.error?.message,
    deals: ((dealsResult.data ?? []) as unknown as DealRow[]).map(mapDealRow),
    dealsError: dealsResult.error?.message,
    customers: (customersResult.data ?? []) as RawCustomer[],
    customersError: customersResult.error?.message,
  };
}

export async function getSalesRepsDashboard(
  period: SalesRepPeriod = "this_month",
): Promise<SalesRepDashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return {
      salesReps: [],
      stats: emptyStats(),
      error: auth.error,
    };
  }

  const now = new Date();
  const periodRange = getPeriodRange(period, now);
  const comparisonRange = getComparisonRange(period, now);

  const raw = await fetchDashboardRaw(auth.user.dealershipId);
  if (raw.usersError) {
    console.warn("getSalesRepsDashboard users:", raw.usersError);
    return {
      salesReps: [],
      stats: emptyStats(),
      error: "Unable to load sales reps.",
    };
  }

  if (raw.dealsError) {
    console.warn("getSalesRepsDashboard deals:", raw.dealsError);
  }

  if (raw.customersError) {
    console.warn("getSalesRepsDashboard customers:", raw.customersError);
  }

  const dealsByRep = new Map<string, RawDeal[]>();
  for (const user of raw.users) {
    dealsByRep.set(user.id, []);
  }

  for (const deal of raw.deals) {
    const repId = resolveRepId(deal);
    if (!repId || !dealsByRep.has(repId)) continue;
    dealsByRep.get(repId)!.push(deal);
  }

  const salesReps = raw.users.map((user) =>
    buildRepListItem(
      user,
      dealsByRep.get(user.id) ?? [],
      raw.customers,
      periodRange,
      comparisonRange,
      now,
    ),
  );

  const stats = computeStatsFromDeals(raw.deals, raw.users, now);

  return { salesReps, stats };
}

/** @deprecated Use getSalesRepsDashboard instead */
export async function getSalesRepsList(period?: SalesRepPeriod) {
  const data = await getSalesRepsDashboard(period);
  return data.salesReps;
}

export { COMMISSION_RATE };
