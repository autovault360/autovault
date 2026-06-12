"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateWholesaleDealer,
  insertVehicleAudit,
  revalidateWholesaleInventoryPaths,
} from "./utils";
import {
  resolveWholesalePaymentStatus,
} from "./helpers";
import { resolveTitleReceivedFields } from "@/lib/vehicles/title-received";
import type { WholesaleVehicleActionResult } from "./update-wholesale-vehicle";

const schema = z.object({
  vehicleId: z.string().uuid(),
  titleReceived: z.boolean(),
});

export async function updateVehicleTitleStatus(
  input: z.infer<typeof schema>,
): Promise<WholesaleVehicleActionResult> {
  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;
    const data = schema.parse(input);

    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from("vehicles")
      .select("status, title_status, title_missing_since")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "Vehicle not found" };
    }

    const titleFields = resolveTitleReceivedFields(
      data.titleReceived,
      existing.title_missing_since,
    );
    const inventoryStatus =
      existing.status === "sold" || existing.status === "pending_sale"
        ? existing.status
        : "in_stock";

    const updatePayload: Record<string, unknown> = {
      ...titleFields,
      wholesale_payment_status: resolveWholesalePaymentStatus({
        inventoryStatus,
        titleStatus: titleFields.title_status,
      }),
    };

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatePayload)
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await insertVehicleAudit(supabase, {
      dealershipId,
      vehicleId: data.vehicleId,
      action: "TITLE_STATUS_CHANGED",
      changedBy: userId,
      newValues: {
        from: existing.title_status,
        to: titleFields.title_status,
      },
    });

    await revalidateWholesaleInventoryPaths();
    return { success: true, vehicleId: data.vehicleId };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update title status",
    };
  }
}
