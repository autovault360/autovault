/**
 * Deal Jacket service layer — all business logic for deal jackets.
 */

import { createClient } from "@/lib/supabase/server";
import { fetchCommissionsByJacketIds } from "@/lib/sales-rep/commissions/server/fetch-commissions-by-jacket-ids";
import { getSignedUrl } from "@/lib/vehicles/server/utils";

export {
  createDealJacket,
  type CreateDealJacketParams,
  type CreateDealJacketResult,
} from "@/lib/deal-jackets/server/create-deal-jacket";

export {
  getDealJacketById,
  type DealJacketDetailDto,
} from "@/lib/deal-jackets/server/get-deal-jacket-by-id";

export {
  listDealJackets,
  type DealJacketListItemDto,
  type ListDealJacketsResult,
} from "@/lib/deal-jackets/server/list-deal-jackets";

export {
  calculateDealJacketFinancials,
  type FinancialResult,
} from "@/lib/deal-jackets/server/calculate-financials";

export {
  submitDealJacket,
  type SubmitDealJacketFormData,
  type SubmitDealJacketResult,
} from "@/lib/deal-jackets/server/submit-deal-jacket";

export type {
  CreateDealJacketSaleData,
  DealJacketDocumentInput,
} from "@/lib/deal-jackets/server/db-types";

/* ──────── Shared query functions for cross-module reuse ──────── */

export type JacketRow = {
  id: string;
  sold_price: number;
  total_invested: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  total_tax: number;
  date_sold: string;
  vehicle_id: string;
  amount_financed: number;
  sales_rep_id: string | null;
  vehicle: { acquisition_cost: number | null; lot_location: string | null } | null;
};

export type JacketRowExtended = JacketRow & {
  jacket_number: string | null;
  commission_status: string;
  balance_due: number;
  vehicle: { acquisition_cost: number | null; lot_location: string | null; year: number; make: string; model: string; stock_number: string | null; vin: string } | null;
  customer: { name: string; phone: string } | null;
  sales_rep: { full_name: string } | null;
};

export type RecentDeal = {
  jacketNumber: string;
  customerName: string;
  vehicleTitle: string;
  status: string;
  salesPrice: number;
  profit: number;
  dateSold: string;
};

export type DealAggregates = {
  grossProfit: number;
  netProfit: number;
  totalTax: number;
  totalCommission: number;
  totalSales: number;
  count: number;
};

export type DealJacketStatusCounts = {
  completed: number;
  inProgress: number;
  missingDocs: number;
  funded: number;
  total: number;
};

export async function fetchJacketsInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<JacketRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      sold_price,
      total_invested,
      profit_gross,
      profit_net,
      commission_amount,
      total_tax,
      date_sold,
      vehicle_id,
      amount_financed,
      sales_rep_id,
      vehicle:vehicles(acquisition_cost, lot_location)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`)
    .order("date_sold", { ascending: false });

  if (error) {
    console.warn("fetchJacketsInRange:", error.message);
    return [];
  }

  return (data ?? []) as unknown as JacketRow[];
}

export async function fetchJacketsInRangeExtended(
  dealershipId: string,
  from: string,
  to: string,
): Promise<JacketRowExtended[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      id,
      jacket_number,
      sold_price,
      total_invested,
      profit_gross,
      profit_net,
      commission_amount,
      total_tax,
      date_sold,
      vehicle_id,
      amount_financed,
      balance_due,
      sales_rep_id,
      vehicle:vehicles(acquisition_cost, lot_location, year, make, model, stock_number, vin),
      customer:customers(name, phone),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`)
    .order("date_sold", { ascending: false });

  if (error) {
    console.warn("fetchJacketsInRangeExtended:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown> & { id: string }>;
  const commissionMap = await fetchCommissionsByJacketIds(rows.map((r) => r.id));

  return rows.map((row) => ({
    ...row,
    commission_status: commissionMap.get(row.id)?.status ?? "pending_review",
  })) as unknown as JacketRowExtended[];
}

export async function getDealAggregates(
  dealershipId: string,
  from: string,
  to: string,
): Promise<DealAggregates> {
  const jackets = await fetchJacketsInRange(dealershipId, from, to);

  const grossProfit = jackets.reduce((s, j) => s + Number(j.profit_gross ?? 0), 0);
  const netProfit = jackets.reduce((s, j) => s + Number(j.profit_net ?? 0), 0);
  const totalTax = jackets.reduce((s, j) => s + Number(j.total_tax ?? 0), 0);
  const totalCommission = jackets.reduce((s, j) => s + Number(j.commission_amount ?? 0), 0);
  const totalSales = jackets.reduce((s, j) => s + Number(j.sold_price ?? 0), 0);

  return {
    grossProfit,
    netProfit,
    totalTax,
    totalCommission,
    totalSales,
    count: jackets.length,
  };
}

export async function getRecentDeals(
  dealershipId: string,
  limit: number = 5,
  statusFilter?: string,
): Promise<RecentDeal[]> {
  const supabase = await createClient();

  let query = supabase
    .from("deal_jackets")
    .select(
      `
      jacket_number,
      sold_price,
      profit_net,
      date_sold,
      vehicle:vehicles(year, make, model),
      customer:customers(name)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("date_sold", { ascending: false })
    .limit(limit);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("workflow_status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("getRecentDeals:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Array<{
    jacket_number: string | null;
    sold_price: number;
    profit_net: number;
    date_sold: string;
    vehicle: { year: number; make: string; model: string } | null;
    customer: { name: string } | null;
  }>).map((row) => {
    const v = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    const c = Array.isArray(row.customer) ? row.customer[0] : row.customer;
    return {
      jacketNumber: row.jacket_number ?? "",
      customerName: c?.name ?? "Unknown",
      vehicleTitle: v ? `${v.year} ${v.make} ${v.model}` : "Unknown",
      status: "Sold",
      salesPrice: Number(row.sold_price ?? 0),
      profit: Number(row.profit_net ?? 0),
      dateSold: row.date_sold ?? "",
    };
  });
}

export async function getPendingCommissions(dealershipId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("sales_rep_commissions")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("status", ["pending_review", "changes_requested", "resubmitted", "approved"]);

  if (error) {
    console.warn("getPendingCommissions:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getDealJacketStatusCounts(
  dealershipId: string,
): Promise<DealJacketStatusCounts> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select("id, amount_financed, balance_due")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (error) {
    console.warn("getDealJacketStatusCounts:", error.message);
    return { completed: 0, inProgress: 0, missingDocs: 0, funded: 0, total: 0 };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    amount_financed: number | null;
    balance_due: number | null;
  }>;

  const total = rows.length;
  const funded = rows.filter((r) => Number(r.amount_financed ?? 0) > 0 && Number(r.balance_due ?? 0) <= 0.01).length;
  const inProgress = rows.filter((r) => Number(r.balance_due ?? 0) > 0.01).length;

  return {
    completed: rows.length - inProgress - funded,
    inProgress,
    missingDocs: 0,
    funded,
    total,
  };
}

export async function getDealCountInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("deal_jackets")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`);

  if (error) {
    console.warn("getDealCountInRange:", error.message);
    return 0;
  }
  return count ?? 0;
}
