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
import { checkVinUniqueness } from "@/lib/vehicles/server/utils";
import { resolveTitleReceivedFields } from "@/lib/vehicles/title-received";

const schema = z.object({
  vehicleId: z.string().uuid(),
  vin: z.string().length(17),
  year: z.coerce.number().min(1980).max(2035),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  stockNumber: z.string().min(1),
  mileage: z.coerce.number().optional(),
  lotLocation: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
  acquisitionCost: z.coerce.number().min(0),
  auctionFees: z.coerce.number().min(0).default(0),
  transportationCosts: z.coerce.number().min(0).default(0),
  reconRepairDetails: z.coerce.number().min(0).default(0),
  storageFees: z.coerce.number().min(0).default(0),
  dealerFees: z.coerce.number().min(0).default(0),
  marketValue: z.coerce.number().min(0),
  wholesaleValue: z.coerce.number().min(0).optional(),
  titleReceived: z.boolean(),
  inventoryStatus: z.enum(["in_stock", "pending_sale", "sold", "arbitration"]),
  arbitrationReason: z.string().max(200).optional(),
  arbitrationBuyerDealer: z.string().max(120).optional(),
  odometerStatus: z.string().optional(),
  notes: z.string().max(500).optional(),
  acquisitionDate: z.string().optional(),
  timesInAuction: z.coerce.number().min(0).optional(),
  nextAuctionDate: z.string().optional(),
  lastAuctionDate: z.string().optional(),
  soldAt: z.string().optional(),
  soldPrice: z.coerce.number().optional(),
});

export type WholesaleVehicleActionResult =
  | { success: true; vehicleId: string }
  | { success: false; error: string };

export async function updateWholesaleVehicle(
  formData: FormData,
): Promise<WholesaleVehicleActionResult> {
  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("vehicles")
      .select("status, title_status, vin, title_missing_since, arbitration_listed_at")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!existing) {
      return { success: false, error: "Vehicle not found" };
    }

    if (existing.vin !== data.vin.toUpperCase()) {
      const { isDuplicate } = await checkVinUniqueness(
        data.vin.toUpperCase(),
        data.vehicleId,
      );
      if (isDuplicate) {
        return {
          success: false,
          error: "A vehicle with this VIN already exists in your dealership",
        };
      }
    }

    const titleFields = resolveTitleReceivedFields(
      data.titleReceived,
      existing.title_missing_since,
    );

    const dbStatus = mapInventoryStatusToDb(data.inventoryStatus);

    const reconditioningCost = data.reconRepairDetails;
    const totalInvested =
      data.acquisitionCost +
      reconditioningCost +
      data.auctionFees +
      data.transportationCosts +
      data.storageFees +
      data.dealerFees;
    const wholesaleValue = data.wholesaleValue ?? data.marketValue;

    const updatePayload: Record<string, unknown> = {
      vin: data.vin.toUpperCase(),
      stock_number: data.stockNumber,
      make: data.make,
      model: data.model,
      trim: data.trim,
      year: data.year,
      mileage: data.mileage,
      lot_location: data.lotLocation,
      condition: data.condition,
      acquisition_date: data.acquisitionDate || null,
      acquisition_cost: data.acquisitionCost,
      market_value: data.marketValue,
      wholesale_price: wholesaleValue,
      reconditioning_cost: reconditioningCost,
      wholesale_auction_fees: data.auctionFees,
      wholesale_transport_cost: data.transportationCosts,
      wholesale_storage_cost: data.storageFees,
      wholesale_dealer_fees: data.dealerFees,
      total_invested: totalInvested,
      ...titleFields,
      odometer_status: data.odometerStatus || null,
      notes: data.notes || null,
      status: dbStatus,
      sold_at:
        data.soldAt ||
        (dbStatus === "sold" ? todayISO() : null),
      sold_price: data.soldPrice ?? null,
      wholesale_payment_status: resolveWholesalePaymentStatus({
        inventoryStatus: data.inventoryStatus,
        titleStatus: titleFields.title_status,
      }),
      times_in_auction: data.timesInAuction ?? 0,
      next_auction_date: data.nextAuctionDate || null,
      last_auction_date: data.lastAuctionDate || null,
      ...resolveArbitrationFields({
        inventoryStatus: data.inventoryStatus,
        previousStatus: existing.status,
        arbitrationReason: data.arbitrationReason,
        arbitrationBuyerDealer: data.arbitrationBuyerDealer,
        existingListedAt: existing.arbitration_listed_at as string | null,
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

    if (existing.status !== dbStatus) {
      await insertStatusHistory(supabase, {
        vehicleId: data.vehicleId,
        dealershipId,
        fromStatus: existing.status,
        toStatus: dbStatus,
        changedBy: userId,
        notes: "Inventory status updated",
      });
    }

    await insertVehicleAudit(supabase, {
      dealershipId,
      vehicleId: data.vehicleId,
      action: "WHOLESALE_UPDATE",
      changedBy: userId,
      newValues: { vin: data.vin, status: dbStatus, title_status: titleFields.title_status },
    });

    await revalidateWholesaleInventoryPaths();
    return { success: true, vehicleId: data.vehicleId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update vehicle",
    };
  }
}
