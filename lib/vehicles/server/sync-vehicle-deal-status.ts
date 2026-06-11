import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const REVERT_TO_STATUS = "in_stock" as const;

export async function markVehiclePendingDeal(
  supabase: SupabaseClient,
  params: {
    vehicleId: string;
    dealershipId: string;
    changedBy: string;
    notes?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { vehicleId, dealershipId, changedBy, notes } = params;

  const { data: vehicle, error: fetchError } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !vehicle) {
    return { ok: false, error: "Vehicle not found" };
  }

  const fromStatus = vehicle.status as string;
  if (fromStatus === "pending_deal") {
    return { ok: true };
  }

  if (fromStatus === "sold" || fromStatus === "loss") {
    return { ok: false, error: "Vehicle is already marked as sold" };
  }

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ status: "pending_deal" })
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from("status_history").insert({
    vehicle_id: vehicleId,
    dealership_id: dealershipId,
    from_status: fromStatus,
    to_status: "pending_deal",
    notes: notes ?? "Deal jacket submitted for review",
    changed_by: changedBy,
  });

  return { ok: true };
}

export async function releaseVehicleFromPendingDeal(
  supabase: SupabaseClient,
  params: {
    vehicleId: string;
    dealershipId: string;
    changedBy: string;
    notes?: string;
  },
): Promise<void> {
  const { vehicleId, dealershipId, changedBy, notes } = params;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!vehicle || vehicle.status !== "pending_deal") {
    return;
  }

  await supabase
    .from("vehicles")
    .update({ status: REVERT_TO_STATUS })
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId);

  await supabase.from("status_history").insert({
    vehicle_id: vehicleId,
    dealership_id: dealershipId,
    from_status: "pending_deal",
    to_status: REVERT_TO_STATUS,
    notes: notes ?? "Deal jacket rejected - vehicle returned to inventory",
    changed_by: changedBy,
  });
}
