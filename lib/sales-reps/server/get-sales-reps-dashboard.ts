import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
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
  buildRepListItemFromJackets,
  computeCommissionForDeals,
  computeCommissionForJackets,
  resolveJacketRepId,
  resolveRepId,
  type RawCustomer,
  type RawDeal,
  type RawJacket,
  type RawUser,
} from "./metrics";

type JacketRow = {
  date_sold: string;
  sold_price: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  total_invested: number;
  sales_rep_id: string | null;
  created_by: string | null;
};

function mapJacketRow(row: JacketRow): RawJacket {
  return {
    date_sold: (row.date_sold as string).slice(0, 10),
    sales_rep_id: row.sales_rep_id,
    created_by: row.created_by,
    sold_price: Number(row.sold_price ?? 0),
    profit_gross: Number(row.profit_gross ?? 0),
    profit_net: Number(row.profit_net ?? 0),
    commission_amount: Number(row.commission_amount ?? 0),
    total_invested: Number(row.total_invested ?? 0),
  };
}

type DealRow = {
  sale_date: string;
  total_price_otd: number;
  total_collected: number;
  created_by: string;
  customer: { sales_rep_id: string | null } | { sales_rep_id: string | null }[] | null;
  vehicle: { total_invested: number } | { total_invested: number }[] | null;
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone?: string | null;
  is_active: boolean;
  commission_rate?: number | null;
  monthly_goal?: number | null;
  image_url?: string | null;
};

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("column")
  );
}

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

function normalizeUser(row: UserRow): RawUser {
  return {
    id: row.id,
    full_name: row.full_name ?? "",
    email: row.email,
    is_active: row.is_active,
    phone: row.phone ?? null,
    commission_rate: row.commission_rate ?? null,
    monthly_goal: row.monthly_goal ?? null,
    image_url: row.image_url ?? null,
  };
}

async function fetchSalesRepUsers(
  dealershipId: string,
): Promise<{ users: RawUser[]; error: string | null }> {
  const supabase = await createClient();

  const extended = await supabase
    .from("users")
    .select(
      "id, full_name, email, phone, is_active, commission_rate, monthly_goal, image_url",
    )
    .eq("dealership_id", dealershipId)
    .in("role", ["owner", "manager", "sales_rep"])
    .order("full_name");

  if (!extended.error) {
    return {
      users: (extended.data ?? []).map((row) => normalizeUser(row as UserRow)),
      error: null,
    };
  }

  if (isMissingColumnError(extended.error.message)) {
    console.warn(
      "getSalesRepsDashboard: profile columns missing, using base user fields. Apply migration 00013.",
    );
    const basic = await supabase
      .from("users")
      .select("id, full_name, email, is_active")
      .eq("dealership_id", dealershipId)
      .in("role", ["owner", "manager", "sales_rep"])
      .order("full_name");

    if (basic.error) {
      return { users: [], error: basic.error.message };
    }

    return {
      users: (basic.data ?? []).map((row) =>
        normalizeUser({
          ...(row as UserRow),
          phone: null,
          commission_rate: null,
          monthly_goal: null,
          image_url: null,
        }),
      ),
      error: null,
    };
  }

  return { users: [], error: extended.error.message };
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

  const commissionsPaidMtd = computeCommissionForDeals(mtdDeals, users);
  const commissionsPaidPrevMtd = computeCommissionForDeals(prevMtdDeals, users);
  const totalCommissionsYtd = computeCommissionForDeals(ytdDeals, users);
  const totalCommissionsPrevYtd = computeCommissionForDeals(prevYtdDeals, users);

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
    computeCommissionForDeals(
      repDeals.filter((d) => monthKey(d.sale_date) === key),
      users,
    ),
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

function computeStatsFromJackets(
  jackets: RawJacket[],
  users: RawUser[],
  now: Date,
): SalesRepStats {
  const repIds = new Set(users.map((u) => u.id));
  const repJackets = jackets.filter((j) => {
    const repId = resolveJacketRepId(j);
    return repId != null && repIds.has(repId);
  });

  const mtdStart = monthStart(now);
  const mtdEnd = monthEnd(now);
  const prevMtdStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevMtdEnd = monthEnd(prevMtdStart);

  const mtdJackets = repJackets.filter((j) => inRange(j.date_sold, mtdStart, mtdEnd));
  const prevMtdJackets = repJackets.filter((j) =>
    inRange(j.date_sold, prevMtdStart, prevMtdEnd),
  );

  const ytdStart = yearStart(now);
  const ytdJackets = repJackets.filter((j) => inRange(j.date_sold, ytdStart, now));
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
  const prevYtdJackets = repJackets.filter((j) =>
    inRange(j.date_sold, prevYtdStart, prevYtdEnd),
  );

  const commissionsPaidMtd = computeCommissionForJackets(mtdJackets);
  const commissionsPaidPrevMtd = computeCommissionForJackets(prevMtdJackets);
  const totalCommissionsYtd = computeCommissionForJackets(ytdJackets);
  const totalCommissionsPrevYtd = computeCommissionForJackets(prevYtdJackets);

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
    computeCommissionForJackets(
      repJackets.filter((j) => monthKey(j.date_sold) === key),
    ),
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

  const usersResult = await fetchSalesRepUsers(dealershipId);

  const [jacketsResult, dealsResult, customersResult] = await Promise.all([
    supabase
      .from("deal_jackets")
      .select(
        "date_sold, sold_price, profit_gross, profit_net, commission_amount, total_invested, sales_rep_id, created_by",
      )
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null),
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
    users: usersResult.users,
    usersError: usersResult.error,
    jackets: ((jacketsResult.data ?? []) as JacketRow[]).map(mapJacketRow),
    jacketsError: jacketsResult.error?.message,
    deals: ((dealsResult.data ?? []) as unknown as DealRow[]).map(mapDealRow),
    dealsError: dealsResult.error?.message,
    customers: (customersResult.data ?? []) as RawCustomer[],
    customersError: customersResult.error?.message,
  };
}

async function signUserImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("user-images")
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function getSalesRepsDashboard(
  period: SalesRepPeriod = "this_month",
): Promise<SalesRepDashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    console.warn("getSalesRepsDashboard: auth failed", auth.error);
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

  if (raw.jacketsError) {
    console.warn("getSalesRepsDashboard jackets:", raw.jacketsError);
  }

  if (raw.dealsError) {
    console.warn("getSalesRepsDashboard deals:", raw.dealsError);
  }

  if (raw.customersError) {
    console.warn("getSalesRepsDashboard customers:", raw.customersError);
  }

  const useJackets = raw.jackets.length > 0 && !raw.jacketsError;
  const supabase = await createClient();

  const salesReps = await Promise.all(
    raw.users.map(async (user) => {
      let imageUrl: string | null = null;
      if (user.image_url) {
        imageUrl = await signUserImage(supabase, user.image_url);
      }

      if (useJackets) {
        const repJackets = raw.jackets.filter(
          (j) => resolveJacketRepId(j) === user.id,
        );
        const item = buildRepListItemFromJackets(
          user,
          repJackets,
          raw.customers,
          periodRange,
          comparisonRange,
          now,
        );
        return { ...item, imageUrl };
      }

      const repDeals = raw.deals.filter((d) => resolveRepId(d) === user.id);
      const item = buildRepListItem(
        user,
        repDeals,
        raw.customers,
        periodRange,
        comparisonRange,
        now,
      );
      return { ...item, imageUrl };
    }),
  );

  const stats = useJackets
    ? computeStatsFromJackets(raw.jackets, raw.users, now)
    : computeStatsFromDeals(raw.deals, raw.users, now);

  return { salesReps, stats };
}

export async function getSalesRepsList(period?: SalesRepPeriod) {
  const data = await getSalesRepsDashboard(period);
  return data.salesReps;
}
