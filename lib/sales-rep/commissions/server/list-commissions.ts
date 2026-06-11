"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser, getSignedUrl } from "@/lib/vehicles/server/utils";
import type {
  SalesRepCommissionListItem,
  SalesRepCommissionSummary,
  SalesRepCommissionStatus,
  SalesRepCommissionsData,
} from "../types";

export async function listSalesRepCommissions(params?: {
  salesRepId?: string;
  dealershipId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<SalesRepCommissionsData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { summary: emptySummary(), entries: [], totalCount: 0 };
  }

  const supabase = await createClient();
  const dealershipId = params?.dealershipId ?? auth.user.dealershipId;
  const salesRepId = params?.salesRepId ?? auth.user.userId;

  let query = supabase
    .from("sales_rep_commissions")
    .select(`
      id,
      dealership_id,
      sales_rep_id,
      deal_jacket_id,
      commission_amount,
      commission_rate,
      gross_profit,
      sold_price,
      status,
      paid_at,
      paid_by,
      created_at,
      updated_at,
      deleted_at,
      deal_jacket:deal_jacket_id!inner(
        id,
        jacket_number,
        sold_price,
        date_sold,
        vehicle:vehicle_id(
          id, year, make, model, trim, stock_number, vin
        ),
        customer:customer_id(
          id, name, phone
        ),
        profit_gross
      )
    `)
    .eq("dealership_id", dealershipId)
    .eq("sales_rep_id", salesRepId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error("Failed to list commissions:", error.message);
    return { summary: emptySummary(), entries: [], totalCount: 0 };
  }

  const vehicleIds = (rows ?? [])
    .map((r: Record<string, unknown>) => {
      const dj = r.deal_jacket as Record<string, unknown> | undefined;
      const vehicle = dj?.vehicle as Record<string, unknown> | undefined;
      return vehicle?.id as string | undefined;
    })
    .filter((id): id is string => Boolean(id));

  const imageByVehicle = new Map<string, string>();
  if (vehicleIds.length > 0) {
    const { data: images } = await supabase
      .from("vehicle_images")
      .select("vehicle_id, storage_path, is_primary")
      .in("vehicle_id", vehicleIds)
      .is("deleted_at", null)
      .order("is_primary", { ascending: false });

    for (const img of images ?? []) {
      if (!imageByVehicle.has(img.vehicle_id) || img.is_primary) {
        imageByVehicle.set(img.vehicle_id, img.storage_path);
      }
    }
  }

  const entries: SalesRepCommissionListItem[] = await Promise.all(
    (rows ?? []).map(async (r: Record<string, unknown>) => {
    const dj = r.deal_jacket as Record<string, unknown> | undefined;
    const vehicle = dj?.vehicle as Record<string, unknown> | undefined;
    const customer = dj?.customer as Record<string, unknown> | undefined;
    const vehicleId = vehicle?.id as string | undefined;

    let imageUrl: string | null = null;
    if (vehicleId) {
      const storagePath = imageByVehicle.get(vehicleId);
      if (storagePath) {
        try {
          imageUrl = await getSignedUrl("vehicle-images", storagePath, 3600);
        } catch {
          imageUrl = null;
        }
      }
    }

    return {
      id: r.id as string,
      dealJacketId: r.deal_jacket_id as string,
      jacketNumber: (dj?.jacket_number as string) ?? "",
      year: (vehicle?.year as number) ?? 0,
      make: (vehicle?.make as string) ?? "",
      model: (vehicle?.model as string) ?? "",
      trim: (vehicle?.trim as string) ?? "",
      stockNumber: (vehicle?.stock_number as string) ?? "",
      imageUrl,
      customerName: (customer?.name as string) ?? "",
      customerPhone: (customer?.phone as string) ?? "",
      saleDate: (dj?.date_sold as string) ?? "",
      soldPrice: Number(r.sold_price ?? 0),
      grossProfit: Number(r.gross_profit ?? 0),
      commissionRate: Number(r.commission_rate ?? 0),
      commissionAmount: Number(r.commission_amount ?? 0),
      status: r.status as SalesRepCommissionStatus,
      paidAt: (r.paid_at as string) ?? null,
    };
  }),
  );

  const totalCount = entries.length;
  const summary = buildSummary(entries);

  return { summary, entries, totalCount };
}

function emptySummary(): SalesRepCommissionSummary {
  return {
    totalCommissions: 0,
    paidCommissions: 0,
    pendingApproval: 0,
    approvedUnpaid: 0,
    rejectedCount: 0,
    totalVehiclesSold: 0,
    periodLabel: "",
  };
}

function buildSummary(entries: SalesRepCommissionListItem[]): SalesRepCommissionSummary {
  const totalCommissions = entries.reduce((s, e) => s + e.commissionAmount, 0);
  const paidCommissions = entries
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.commissionAmount, 0);
  const pendingApproval = entries
    .filter((e) =>
      ["pending_review", "changes_requested", "resubmitted"].includes(e.status),
    )
    .length;
  const approvedUnpaid = entries
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.commissionAmount, 0);

  return {
    totalCommissions,
    paidCommissions,
    pendingApproval,
    approvedUnpaid,
    rejectedCount: entries.filter((e) => e.status === "rejected").length,
    totalVehiclesSold: entries.length,
    periodLabel: "",
  };
}
