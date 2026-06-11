"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { SalesRepCommissionRow, SalesRepCommissionStatus } from "../types";

export async function createCommission(params: {
  dealershipId: string;
  salesRepId: string;
  dealJacketId: string;
  commissionAmount: number;
  commissionRate: number;
  grossProfit: number;
  soldPrice: number;
  status?: SalesRepCommissionStatus;
}): Promise<SalesRepCommissionRow | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("sales_rep_commissions")
    .insert({
      dealership_id: params.dealershipId,
      sales_rep_id: params.salesRepId,
      deal_jacket_id: params.dealJacketId,
      commission_amount: params.commissionAmount,
      commission_rate: params.commissionRate,
      gross_profit: params.grossProfit,
      sold_price: params.soldPrice,
      status: params.status ?? "pending_review",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create commission:", error.message);
    return null;
  }

  await supabase
    .from("deal_jackets")
    .update({ sales_rep_commission_id: data.id })
    .eq("id", params.dealJacketId);

  return data as SalesRepCommissionRow;
}

export async function createCommissionOnDealJacket(
  dealJacketId: string,
  status: SalesRepCommissionStatus = "pending_review",
): Promise<SalesRepCommissionRow | null> {
  const supabase = createServiceClient();

  const { data: jacket } = await supabase
    .from("deal_jackets")
    .select("*")
    .eq("id", dealJacketId)
    .is("deleted_at", null)
    .single();

  if (!jacket || !jacket.sales_rep_id) return null;

  const { data: repProfile } = await supabase
    .from("sales_rep_profiles")
    .select("commission_rate")
    .eq("user_id", jacket.sales_rep_id)
    .maybeSingle();

  const commissionRate =
    repProfile?.commission_rate != null && Number(repProfile.commission_rate) >= 0
      ? Number(repProfile.commission_rate)
      : 0;

  return createCommission({
    dealershipId: jacket.dealership_id,
    salesRepId: jacket.sales_rep_id,
    dealJacketId: jacket.id,
    commissionAmount: Number(jacket.commission_amount),
    commissionRate,
    grossProfit: Number(jacket.profit_gross),
    soldPrice: Number(jacket.sold_price),
    status,
  });
}
