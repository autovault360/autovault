"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertVehicleActive, authenticateUser } from "@/lib/vehicles/server/utils";

const schema = z.object({
  vehicleId: z.string().uuid(),
  field: z.enum([
    "acquisition_cost",
    "auction_fees",
    "reconditioning_cost",
    "flooring_fees",
    "registration_fees",
  ]),
  value: z.coerce.number().min(0),
});

export async function updateInventoryCell(payload: unknown) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!["super_admin", "owner", "manager", "cpa"].includes(auth.user.role)) {
      return { success: false, error: "Insufficient permissions to edit inventory fields" };
    }

    const input = schema.parse(payload);
    const supabase = await createClient();
    const activeError = await assertVehicleActive(
      supabase,
      input.vehicleId,
      auth.user.dealershipId,
    );
    if (activeError) return { success: false, error: activeError };

    const { data: existing, error: fetchError } = await supabase
      .from("vehicles")
      .select("acquisition_cost, auction_fees, reconditioning_cost, flooring_fees, registration_fees")
      .eq("id", input.vehicleId)
      .eq("dealership_id", auth.user.dealershipId)
      .single();

    if (fetchError || !existing) return { success: false, error: "Vehicle not found" };

    const next = {
      acquisition_cost: Number(existing.acquisition_cost ?? 0),
      auction_fees: Number(existing.auction_fees ?? 0),
      reconditioning_cost: Number(existing.reconditioning_cost ?? 0),
      flooring_fees: Number(existing.flooring_fees ?? 0),
      registration_fees: Number(existing.registration_fees ?? 0),
      [input.field]: input.value,
    };
    const totalInvested =
      next.acquisition_cost +
      next.auction_fees +
      next.reconditioning_cost +
      next.flooring_fees +
      next.registration_fees;

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ [input.field]: input.value, total_invested: totalInvested })
      .eq("id", input.vehicleId)
      .eq("dealership_id", auth.user.dealershipId);

    if (updateError) return { success: false, error: updateError.message };

    await supabase.from("audit_logs").insert({
      dealership_id: auth.user.dealershipId,
      entity_type: "vehicles",
      entity_id: input.vehicleId,
      action: "INVENTORY_FIELD_UPDATED",
      new_values: { field: input.field, value: input.value, total_invested: totalInvested },
      changed_by: auth.user.userId,
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${input.vehicleId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
