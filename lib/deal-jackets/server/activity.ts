"use server";

import { createClient } from "@/lib/supabase/server";
import type { WorkflowAction, DealJacketActivityRow } from "../types";

export type LogActivityParams = {
  dealJacketId: string;
  action: WorkflowAction;
  actorId: string;
  actorName: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  detail?: Record<string, unknown> | null;
};

export async function logDealJacketActivity(
  params: LogActivityParams,
): Promise<DealJacketActivityRow | null> {
  const supabase = await createClient();
  const { dealJacketId, action, actorId, actorName, oldStatus, newStatus, detail } = params;

  const { data, error } = await supabase
    .from("deal_jacket_activity")
    .insert({
      deal_jacket_id: dealJacketId,
      action,
      actor_id: actorId,
      actor_name: actorName,
      old_status: oldStatus ?? null,
      new_status: newStatus ?? null,
      detail: detail ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to log activity:", error.message);
    return null;
  }

  return data as DealJacketActivityRow;
}

export type FetchActivityParams = {
  dealJacketId: string;
};

export async function fetchDealJacketActivity(
  params: FetchActivityParams,
): Promise<DealJacketActivityRow[]> {
  const supabase = await createClient();
  const { dealJacketId } = params;

  const { data, error } = await supabase
    .from("deal_jacket_activity")
    .select("*")
    .eq("deal_jacket_id", dealJacketId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch activity:", error.message);
    return [];
  }

  return data as DealJacketActivityRow[];
}
