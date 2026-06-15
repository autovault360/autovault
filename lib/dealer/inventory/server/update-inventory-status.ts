"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  authenticateWholesaleDealer,
  insertStatusHistory,
  insertVehicleAudit,
  revalidateWholesaleInventoryPaths,
} from "./utils";
import {
  resolveWholesalePaymentStatus,
  todayISO,
  mapInventoryStatusToDb,
  resolveArbitrationFields,
} from "./helpers";
import { mapDbTitleReceived } from "@/lib/vehicles/title-received";
import type { WholesaleVehicleActionResult } from "./update-wholesale-vehicle";

const schema = z.object({
  vehicleId: z.string().uuid(),
  inventoryStatus: z.enum(["in_stock", "pending_sale", "sold", "arbitration"]),
  arbitrationReason: z.string().max(200).optional(),
  arbitrationBuyerDealer: z.string().max(120).optional(),
  timesInAuction: z.coerce.number().min(0).optional(),
  nextAuctionDate: z.string().optional(),
  lastAuctionDate: z.string().optional(),
  soldAt: z.string().optional(),
  soldPrice: z.coerce.number().optional(),
});

export async function updateInventoryStatus(
  input: z.infer<typeof schema>,
): Promise<WholesaleVehicleActionResult> {
  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;
    const data = schema.parse(input);

    if (
      data.inventoryStatus === "arbitration" &&
      !data.arbitrationReason?.trim()
    ) {
      return { success: false, error: "Arbitration reason is required" };
    }

    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from("vehicles")
      .select(
        "status, title_status, title_received, arbitration_listed_at",
      )
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "Vehicle not found" };
    }

    const dbStatus = mapInventoryStatusToDb(data.inventoryStatus);

    const titleReceived = mapDbTitleReceived(
      existing.title_received as boolean | null | undefined,
      existing.title_status,
    );
    const titleStatus = titleReceived ? "received" : "missing";

    const updatePayload: Record<string, unknown> = {
      status: dbStatus,
      wholesale_payment_status: resolveWholesalePaymentStatus({
        inventoryStatus: data.inventoryStatus,
        titleStatus,
      }),
      ...resolveArbitrationFields({
        inventoryStatus: data.inventoryStatus,
        previousStatus: existing.status,
        arbitrationReason: data.arbitrationReason,
        arbitrationBuyerDealer: data.arbitrationBuyerDealer,
        existingListedAt: existing.arbitration_listed_at as string | null,
      }),
    };

    if (data.inventoryStatus === "pending_sale") {
      if (data.timesInAuction != null) {
        updatePayload.times_in_auction = data.timesInAuction;
      }
      if (data.nextAuctionDate) updatePayload.next_auction_date = data.nextAuctionDate;
      if (data.lastAuctionDate) {
        updatePayload.last_auction_date = data.lastAuctionDate;
      }
    }

    if (data.inventoryStatus === "sold") {
      updatePayload.sold_at = data.soldAt || todayISO();
      if (data.soldPrice != null) updatePayload.sold_price = data.soldPrice;
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update(updatePayload)
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (existing.status !== dbStatus) {
      await insertStatusHistory(supabase, {
        vehicleId: data.vehicleId,
        dealershipId,
        fromStatus: existing.status,
        toStatus: dbStatus,
        changedBy: userId,
        notes: "Inventory status changed from actions menu",
      });
    }

    await insertVehicleAudit(supabase, {
      dealershipId,
      vehicleId: data.vehicleId,
      action: "INVENTORY_STATUS_CHANGED",
      changedBy: userId,
      newValues: { from: existing.status, to: dbStatus },
    });

    await revalidateWholesaleInventoryPaths();
    return { success: true, vehicleId: data.vehicleId };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update inventory status",
    };
  }
}
