"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { createCommissionOnDealJacket } from "./create-commission";
import type { SalesRepCommissionRow, SalesRepCommissionStatus } from "../types";

export async function updateCommissionStatus(
  dealJacketId: string,
  status: SalesRepCommissionStatus,
  extraFields?: Record<string, unknown>,
): Promise<SalesRepCommissionRow | null> {
  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...extraFields,
  };

  if (status === "paid") {
    updateData.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("sales_rep_commissions")
    .update(updateData)
    .eq("deal_jacket_id", dealJacketId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Failed to update commission status:", error.message);
    return null;
  }

  if (data) {
    await supabase
      .from("deal_jackets")
      .update({ sales_rep_commission_id: data.id })
      .eq("id", dealJacketId);

    return data as SalesRepCommissionRow;
  }

  const created = await createCommissionOnDealJacket(dealJacketId, status);
  if (!created) {
    console.error(
      "No commission row found for deal jacket and failed to create one:",
      dealJacketId,
    );
    return null;
  }

  return created;
}
