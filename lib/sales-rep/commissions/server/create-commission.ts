"use server";

import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

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

  return data as SalesRepCommissionRow;
}

export async function createCommissionOnDealJacket(
  dealJacketId: string,
): Promise<SalesRepCommissionRow | null> {
  const supabase = await createClient();

  const { data: jacket } = await supabase
    .from("deal_jackets")
    .select("*")
    .eq("id", dealJacketId)
    .is("deleted_at", null)
    .single();

  if (!jacket || !jacket.sales_rep_id) return null;

  return createCommission({
    dealershipId: jacket.dealership_id,
    salesRepId: jacket.sales_rep_id,
    dealJacketId: jacket.id,
    commissionAmount: Number(jacket.commission_amount),
    commissionRate: 0,
    grossProfit: Number(jacket.profit_gross),
    soldPrice: Number(jacket.sold_price),
    status: "pending_review",
  });
}
