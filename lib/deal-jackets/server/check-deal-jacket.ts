"use server";

import { createClient } from "@/lib/supabase/server";
import { requireDealJacketAuth } from "./auth";

export async function checkVehicleHasDealJacket(
  vehicleId: string,
): Promise<{ hasJacket: boolean; workflowStatus?: string; error?: string }> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { hasJacket: false, error: auth.error };

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const { data: existingRows, error } = await supabase
    .from("deal_jackets")
    .select("id, workflow_status")
    .eq("vehicle_id", vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    return { hasJacket: false, error: error.message };
  }

  const existing = existingRows?.[0];
  if (existing) {
    return { hasJacket: true, workflowStatus: existing.workflow_status };
  }

  return { hasJacket: false };
}
