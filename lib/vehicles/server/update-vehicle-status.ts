"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "./utils";
import { revalidatePath } from "next/cache";

const dbStatuses = ["in_stock", "needs_attention", "pending_deal", "sold", "loss"] as const;

const schema = z.object({
  vehicleId: z.string().uuid(),
  status: z.enum(dbStatuses),
  notes: z.string().max(500).optional(),
});

export async function updateVehicleStatus(formData: FormData) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId, role } = auth.user;

    if (!["super_admin", "owner", "manager"].includes(role)) {
      return { success: false, error: "Only managers can change vehicle status" };
    }

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const { data: vehicle, error: fetchError } = await supabase
      .from("vehicles")
      .select("status")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .single();

    if (fetchError || !vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    const fromStatus = vehicle.status as string;

    if (fromStatus === data.status) {
      return { success: false, error: "Vehicle already has this status" };
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ status: data.status })
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId);

    if (updateError) throw new Error(updateError.message);

    await supabase.from("status_history").insert({
      vehicle_id: data.vehicleId,
      dealership_id: dealershipId,
      from_status: fromStatus,
      to_status: data.status,
      notes: data.notes || null,
      changed_by: userId,
    });

    await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "STATUS_CHANGED",
      old_values: { status: fromStatus },
      new_values: { status: data.status },
      changed_by: userId,
    });

    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${data.vehicleId}`);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

