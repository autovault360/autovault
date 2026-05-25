"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export async function updateVehicleNotes(formData: FormData) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const { error } = await supabase
      .from("vehicles")
      .update({ notes: data.notes ?? null })
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId);

    if (error) throw new Error(error.message);

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "NOTES_UPDATED",
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
