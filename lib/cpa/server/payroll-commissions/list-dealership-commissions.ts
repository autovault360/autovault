"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { CpaDealershipCommissionAggregate } from "@/lib/cpa/payroll-commissions/types";
import type { SalesRepCommissionStatus } from "@/lib/sales-rep/commissions/types";

export async function listDealershipCommissions(params?: {
  dealershipId?: string;
}): Promise<{
  aggregates: CpaDealershipCommissionAggregate[];
  totalCommissions: number;
  entryCount: number;
}> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { aggregates: [], totalCommissions: 0, entryCount: 0 };
  }

  const supabase = await createClient();
  const dealershipId = params?.dealershipId ?? auth.user.dealershipId;

  const { data: rows, error } = await supabase
    .from("sales_rep_commissions")
    .select(`
      sales_rep_id,
      commission_amount,
      status,
      sales_rep:users!sales_rep_commissions_sales_rep_id_fkey(full_name)
    `)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (error) {
    console.error("listDealershipCommissions:", error.message);
    return { aggregates: [], totalCommissions: 0, entryCount: 0 };
  }

  const map = new Map<string, CpaDealershipCommissionAggregate>();

  for (const row of rows ?? []) {
    const salesRepId = row.sales_rep_id as string;
    const amount = Number(row.commission_amount ?? 0);
    const salesRepRaw = row.sales_rep as
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
    const salesRep = Array.isArray(salesRepRaw) ? salesRepRaw[0] : salesRepRaw;
    const existing = map.get(salesRepId);

    if (existing) {
      existing.totalCommissions += amount;
      existing.dealCount += 1;
      if (row.status === "paid") {
        existing.paidCommissions += amount;
      }
    } else {
      map.set(salesRepId, {
        salesRepId,
        employeeName: salesRep?.full_name ?? salesRepId,
        totalCommissions: amount,
        paidCommissions: row.status === "paid" ? amount : 0,
        dealCount: 1,
      });
    }
  }

  const aggregates = Array.from(map.values());
  const totalCommissions = aggregates.reduce(
    (sum, item) => sum + item.totalCommissions,
    0,
  );

  return {
    aggregates,
    totalCommissions,
    entryCount: rows?.length ?? 0,
  };
}
