"use server";

import { createClient } from "@/lib/supabase/server";
import type { SalesRepCommissionRow, SalesRepCommissionStatus } from "../types";

export async function updateCommissionStatus(
  dealJacketId: string,
  status: SalesRepCommissionStatus,
  extraFields?: Record<string, unknown>,
): Promise<SalesRepCommissionRow | null> {
  const supabase = await createClient();

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
    .single();

  if (error) {
    console.error("Failed to update commission status:", error.message);
    return null;
  }

  return data as SalesRepCommissionRow;
}
