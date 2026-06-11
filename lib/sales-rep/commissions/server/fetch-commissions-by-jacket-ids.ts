import { createServiceClient } from "@/lib/supabase/server";
import { normalizeCommissionStatus } from "../normalize-status";
import type { SalesRepCommissionStatus } from "../types";

export type JacketCommissionSnapshot = {
  id: string;
  dealJacketId: string;
  status: SalesRepCommissionStatus;
  commissionAmount: number;
  commissionRate: number;
  grossProfit: number;
  soldPrice: number;
  paidAt: string | null;
};

export async function fetchCommissionsByJacketIds(
  jacketIds: string[],
): Promise<Map<string, JacketCommissionSnapshot>> {
  if (jacketIds.length === 0) return new Map();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sales_rep_commissions")
    .select(
      "id, deal_jacket_id, status, commission_amount, commission_rate, gross_profit, sold_price, paid_at",
    )
    .in("deal_jacket_id", jacketIds)
    .is("deleted_at", null);

  if (error) {
    console.error("fetchCommissionsByJacketIds:", error.message);
    return new Map();
  }

  const map = new Map<string, JacketCommissionSnapshot>();
  for (const row of data ?? []) {
    map.set(row.deal_jacket_id, {
      id: row.id,
      dealJacketId: row.deal_jacket_id,
      status: normalizeCommissionStatus(row.status),
      commissionAmount: Number(row.commission_amount),
      commissionRate: Number(row.commission_rate),
      grossProfit: Number(row.gross_profit),
      soldPrice: Number(row.sold_price),
      paidAt: row.paid_at,
    });
  }

  return map;
}
