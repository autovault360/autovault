"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchCommissionsByJacketIds,
} from "@/lib/sales-rep/commissions/server/fetch-commissions-by-jacket-ids";
import {
  isCommissionPending,
  isCommissionPaid,
} from "@/lib/sales-rep/commissions/normalize-status";
import type {
  SalesRepDashboardData,
  IVehicleCard,
  IDealJacketLine,
  ILeaderboardEntry,
  ITopPerformer,
  ISalesRepMetrics,
  IPricingConstants,
} from "@/lib/sales-rep/dashboard/types";
import type { ISalesRepCommissionsData, ISalesRepCommissionRow } from "@/lib/sales-rep/commissions/types";
import { getRecentTeamMessages } from "@/lib/sales-rep/messages/server/get-recent-messages";
import { getTotalUnreadCount } from "@/lib/sales-rep/messages/server/list-conversations";

async function getSignedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  path: string,
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  } catch { return null; }
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

const USER_PROFILE_SELECT = `id, full_name, email, image_url, phone, role, dealership_id,
  sales_rep_profile:sales_rep_profiles(commission_rate, monthly_goal)`;

type RawUserRow = {
  id: string;
  full_name: string | null;
  email: string;
  image_url: string | null;
  phone: string | null;
  role: string | null;
  dealership_id: string | null;
  sales_rep_profile:
    | { commission_rate: number | null; monthly_goal: number | null }
    | { commission_rate: number | null; monthly_goal: number | null }[]
    | null;
};

function normalizeUserRow(row: RawUserRow): {
  id: string;
  full_name: string | null;
  email: string;
  image_url: string | null;
  commission_rate: number | null;
  monthly_goal: number | null;
  phone: string | null;
  role: string | null;
  dealership_id: string | null;
} {
  const profile = Array.isArray(row.sales_rep_profile)
    ? row.sales_rep_profile[0]
    : row.sales_rep_profile;

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    image_url: row.image_url,
    phone: row.phone,
    role: row.role,
    dealership_id: row.dealership_id,
    commission_rate: profile?.commission_rate ?? null,
    monthly_goal: profile?.monthly_goal ?? null,
  };
}

async function fetchUserProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filter: { column: "auth_user_id" | "email"; value: string },
): Promise<
  | { user: ReturnType<typeof normalizeUserRow> }
  | { user: null; error: string | null }
> {
  const { data, error } = await supabase
    .from("users")
    .select(USER_PROFILE_SELECT)
    .eq(filter.column, filter.value)
    .maybeSingle();

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data) {
    return { user: null, error: null };
  }

  return { user: normalizeUserRow(data as RawUserRow) };
}

export async function getSalesRepDashboardData(): Promise<
  { data: SalesRepDashboardData } | { error: string }
> {
  try {
    const supabase = await createClient();

    // Try getUser() first (verifies token with Auth API — layout uses this)
    let { data: { user } } = await supabase.auth.getUser();

    // Fallback to getSession() if getUser() fails
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user ?? null;
    }

    if (!user?.id) return { error: "Authentication required" };

    const authUserId = user.id;

    const byAuth = await fetchUserProfile(supabase, {
      column: "auth_user_id",
      value: authUserId,
    });

    if (byAuth.user) {
      return await buildDashboard(supabase, byAuth.user);
    }

    if (byAuth.error) {
      console.error("getSalesRepDashboardData: users query error", byAuth.error);
      return { error: byAuth.error };
    }

    // Fallback: look up by email (handles impersonation auth_user_id mismatches)
    if (user.email) {
      const byEmail = await fetchUserProfile(supabase, {
        column: "email",
        value: user.email,
      });

      if (byEmail.user) {
        return await buildDashboard(supabase, byEmail.user);
      }

      if (byEmail.error) {
        console.error("getSalesRepDashboardData: email lookup error", byEmail.error);
        return { error: byEmail.error };
      }
    }

    console.error("getSalesRepDashboardData: no users row for", {
      authUserId,
      email: user.email,
    });
    return { error: "User profile not found" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("getSalesRepDashboardData exception:", err);
    return { error: message };
  }
}

async function buildDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dbUser: {
    id: string;
    full_name: string | null;
    email: string;
    image_url: string | null;
    commission_rate: number | null;
    monthly_goal: number | null;
    phone: string | null;
    role: string | null;
    dealership_id: string | null;
  },
): Promise<{ data: SalesRepDashboardData }> {
  const dealershipId = dbUser.dealership_id;
  if (!dealershipId) return { error: "No dealership linked to your account" } as any;

  const userId = dbUser.id;

  let imageUrl: string | null = null;
  if (dbUser.image_url) {
    const signed = await getSignedUrl(supabase, "user-images", dbUser.image_url);
    if (signed) imageUrl = signed;
  }

  const now = new Date();
  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const ytdStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const profile = {
    name: dbUser.full_name ?? "Sales Rep",
    title: "Sales Representative",
    id: dbUser.id,
    initials: getInitials(dbUser.full_name ?? "Sales Rep"),
    imageUrl: imageUrl ?? undefined,
  };

  const [vehiclesResult, jacketsResult, leaderboardResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, vin, stock_number, make, model, year, trim, mileage, exterior_color, asking_price, status, body_style")
      .eq("dealership_id", dealershipId)
      .in("status", ["in_stock", "needs_attention"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("deal_jackets")
      .select(`id, jacket_number, sold_price, total_tax, fees, total_sale_price, down_payment, amount_financed, commission_amount, profit_gross, profit_net, date_sold, workflow_status, created_at, sales_rep_id, created_by,
        vehicle:vehicle_id(id, vin, make, model, year, trim),
        customer:customer_id(id, name, phone, email)`)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .order("date_sold", { ascending: false }),
    supabase
      .from("deal_jackets")
      .select("sales_rep_id, sold_price, commission_amount, profit_gross, profit_net, date_sold")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("date_sold", ytdStart),
  ]);

  if (vehiclesResult.error) console.warn("vehicles error:", vehiclesResult.error.message);
  if (jacketsResult.error) console.warn("jackets error:", jacketsResult.error.message);
  if (leaderboardResult.error) console.warn("leaderboard error:", leaderboardResult.error.message);

  const vehicles = vehiclesResult.data ?? [];
  const allJackets = jacketsResult.data ?? [];
  const salesRepsRaw = leaderboardResult.data ?? [];
  const commissionMap = await fetchCommissionsByJacketIds(allJackets.map((j: { id: string }) => j.id));

  const myJackets = allJackets.filter(
    (j: any) => j.sales_rep_id === userId || j.created_by === userId,
  );
  const myMtdJackets = myJackets.filter((j: any) => (j.date_sold ?? "") >= mtdStart);
  const myYtdJackets = myJackets.filter((j: any) => (j.date_sold ?? "") >= ytdStart);

  const myMetrics: ISalesRepMetrics = {
    currentMonthUnits: myMtdJackets.length,
    currentMonthGross: myMtdJackets.reduce((s: number, j: any) => s + Number(j.profit_gross ?? 0), 0),
    currentMonthCommission: myMtdJackets.reduce((s: number, j: any) => s + Number(j.commission_amount ?? 0), 0),
    awaitingApprovalCommission: myJackets
      .filter((j: { id: string }) => {
        const status = commissionMap.get(j.id)?.status ?? "pending_review";
        return isCommissionPending(status);
      })
      .reduce((s: number, j: { commission_amount?: number }) => s + Number(j.commission_amount ?? 0), 0),
  };

  const inventory: IVehicleCard[] = await Promise.all(
    vehicles.map(async (v: any) => {
      let imgUrl: string | undefined;
      const { data: primaryImg } = await supabase
        .from("vehicle_images")
        .select("storage_path")
        .eq("vehicle_id", v.id)
        .eq("is_primary", true)
        .maybeSingle();
      if (primaryImg?.storage_path) {
        imgUrl = (await getSignedUrl(supabase, "vehicles", primaryImg.storage_path)) ?? undefined;
      }
      return {
        stockNo: v.stock_number ?? `AV-${v.vin?.slice(-6)}`,
        vin: v.vin,
        yearModel: `${v.year} ${v.make} ${v.model}${v.trim ? " " + v.trim : ""}`,
        mileage: v.mileage ? `${Number(v.mileage).toLocaleString()} mi` : "N/A",
        type: v.body_style ?? "N/A",
        color: v.exterior_color ?? "N/A",
        price: Number(v.asking_price ?? 0),
        status:
          v.status === "in_stock" || v.status === "needs_attention"
            ? "Available"
            : v.status === "pending_deal"
              ? "Pending Deal"
              : "Sold",
        imageUrl: imgUrl,
      } as IVehicleCard;
    }),
  );

  const mapWorkflowStatus = (ws: string): IDealJacketLine["status"] => {
    if (ws === "approved") return "Approved";
    if (ws === "changes_requested" || ws === "rejected") return "Changes Requested";
    return "Pending";
  };

  const recentDealJackets: IDealJacketLine[] = myJackets.slice(0, 10).map((j: any) => {
    const vehicle = Array.isArray(j.vehicle) ? j.vehicle[0] : j.vehicle;
    const customer = Array.isArray(j.customer) ? j.customer[0] : j.customer;
    return {
      id: j.jacket_number ?? j.id.slice(0, 8),
      vehicleDesc: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? " " + vehicle.trim : ""}` : "Unknown",
      buyerName: customer?.name ?? "Unknown",
      status: mapWorkflowStatus(j.workflow_status ?? "pending_review"),
      dateString: new Date(j.date_sold ?? j.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
    };
  });

  const repSalesMap = new Map<string, { name: string; units: number }>();
  for (const j of salesRepsRaw as any[]) {
    const rid = j.sales_rep_id;
    if (!rid) continue;
    if (!repSalesMap.has(rid)) repSalesMap.set(rid, { name: rid, units: 0 });
    repSalesMap.get(rid)!.units++;
  }

  const repIds = [...repSalesMap.keys()];
  const { data: repUsers } = await supabase
    .from("users")
    .select("id, full_name, image_url")
    .in("id", repIds);

  const repNameMap = new Map((repUsers ?? []).map((u: any) => [u.id, u.full_name ?? u.id]));
  const repImageMap = new Map((repUsers ?? []).map((u: any) => [u.id, u.image_url as string | null]));
  for (const [id, entry] of repSalesMap) entry.name = repNameMap.get(id) ?? id;

  const sortedReps = [...repSalesMap.entries()]
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 5);

  const leaderboard: ILeaderboardEntry[] = sortedReps.map(([id, entry], idx) => ({
    rank: idx + 1,
    name: entry.name,
    units: entry.units,
    isCurrentUser: id === userId,
  }));

  const topPerformerEntry = leaderboard[0];
  const topPerformerId: string | undefined = sortedReps[0]?.[0];
  let topPerformerImageUrl: string | undefined;
  if (topPerformerId) {
    const raw = repImageMap.get(topPerformerId);
    if (raw) {
      const signed = await getSignedUrl(supabase, "user-images", raw);
      if (signed) topPerformerImageUrl = signed;
    }
  }

  const topPerformer: ITopPerformer = {
    name: topPerformerEntry?.name ?? profile.name,
    imageUrl: topPerformerImageUrl,
    units: topPerformerEntry?.units ?? 0,
    unitsDelta: topPerformerEntry ? (topPerformerEntry.units - (leaderboard[1]?.units ?? 0)) : 0,
    profit: 0,
    profitDelta: 0,
    commission: 0,
    commissionDelta: 0,
  };

  const commissionEntries: ISalesRepCommissionRow[] = myJackets.map((j: any) => {
    const vehicle = Array.isArray(j.vehicle) ? j.vehicle[0] : j.vehicle;
    const customer = Array.isArray(j.customer) ? j.customer[0] : j.customer;
    const commissionStatus = commissionMap.get(j.id)?.status ?? "pending_review";
    return {
      id: j.id,
      dealJacketId: j.jacket_number ?? j.id.slice(0, 8),
      dateSold: new Date(j.date_sold ?? j.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
      vehicle: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? " " + vehicle.trim : ""}` : "Unknown",
      buyerName: customer?.name ?? "Unknown",
      salePrice: Number(j.sold_price ?? 0),
      cost: 0,
      grossProfit: Number(j.profit_gross ?? 0),
      commissionRate: Number(dbUser.commission_rate ?? 0.1),
      commissionEarned: Number(j.commission_amount ?? 0),
      status: isCommissionPaid(commissionStatus) ? "paid" : commissionStatus,
    } as ISalesRepCommissionRow;
  });

  const total = commissionEntries.reduce((s, e) => s + e.commissionEarned, 0);
  const paid = commissionEntries.filter((e) => e.status === "paid").reduce((s, e) => s + e.commissionEarned, 0);
  const pnd = commissionEntries.filter((e) => e.status !== "paid").reduce((s, e) => s + e.commissionEarned, 0);

  const commissions: ISalesRepCommissionsData = {
    summary: {
      totalCarsSold: myYtdJackets.length,
      totalCommission: total,
      paidCommission: paid,
      pendingCommission: pnd,
      heldAdjustments: 0,
      periodLabel: "Year to Date",
    },
    entries: commissionEntries,
  };

  const { data: activityLogs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, new_values, created_at")
    .eq("dealership_id", dealershipId)
    .eq("changed_by", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const recentActivity = (activityLogs ?? []).map((log: any) => ({
    id: log.id,
    message: `${log.action} ${log.entity_type?.replace(/_/g, " ") ?? "item"}`,
    timestamp: new Date(log.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    }),
    type: (log.action === "create" ? "success" : log.action === "update" ? "info" : "warning") as "info" | "success" | "warning" | "upload",
  }));

  const pricing: IPricingConstants = {
    costPrice: 0,
    reconditioning: 0,
    commissionRate: Number(dbUser.commission_rate ?? 0.1),
  };

  const [teamMessages, messageUnreadCount] = await Promise.all([
    getRecentTeamMessages(3),
    getTotalUnreadCount(),
  ]);

  return {
    data: {
      profile,
      topPerformer,
      myMetrics,
      inventory,
      leaderboard,
      recentDealJackets,
      teamMessages,
      recentActivity,
      tradeInOptions: [],
      pricing,
      commissions,
      notificationCount: messageUnreadCount,
    },
  };
}
