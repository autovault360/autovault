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
import { checkVinUniqueness, uploadFile, trackFile } from "@/lib/vehicles/server/utils";
import { resolveTitleReceivedFields } from "@/lib/vehicles/title-received";

const schema = z.object({
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
  inventoryStatus: z
    .enum(["in_stock", "pending_sale", "sold", "arbitration"])
    .default("in_stock"),
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

export async function addWholesaleVehicle(
  formData: FormData,
): Promise<WholesaleVehicleActionResult> {
  const uploadedPaths: string[] = [];

  try {
    const auth = await authenticateWholesaleDealer();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();
    const { isDuplicate } = await checkVinUniqueness(data.vin.toUpperCase());
    if (isDuplicate) {
      return {
        success: false,
        error: "A vehicle with this VIN already exists in your dealership",
      };
    }

    const titleFields = resolveTitleReceivedFields(data.titleReceived);
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

    const { data: vehicle, error: insertError } = await supabase
      .from("vehicles")
      .insert({
        dealership_id: dealershipId,
        vin: data.vin.toUpperCase(),
        stock_number: data.stockNumber,
        make: data.make,
        model: data.model,
        trim: data.trim,
        year: data.year,
        mileage: data.mileage,
        lot_location: data.lotLocation,
        condition: data.condition,
        acquisition_date: data.acquisitionDate || todayISO(),
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
        odometer_status: data.odometerStatus,
        notes: data.notes,
        status: dbStatus,
        sold_at: data.soldAt || (dbStatus === "sold" ? todayISO() : null),
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
          previousStatus: null,
          arbitrationReason: data.arbitrationReason,
          arbitrationBuyerDealer: data.arbitrationBuyerDealer,
        }),
        purchase_type: "wholesale",
        created_by: userId,
      })
      .select("id")
      .single();

    if (insertError) {
      const message = insertError.message?.includes("uq_vehicle_vin")
        ? "A vehicle with this VIN already exists in your dealership"
        : insertError.message;
      throw new Error(message);
    }

    const photos = formData.getAll("photos") as File[];
    for (let i = 0; i < photos.length; i++) {
      if (!photos[i]?.size) continue;
      const ext = photos[i].name.split(".").pop();
      const path = `${dealershipId}/${vehicle.id}/photos/${i}.${ext}`;
      await uploadFile("vehicle-images", path, photos[i]);
      uploadedPaths.push(path);

      await supabase.from("vehicle_images").insert({
        vehicle_id: vehicle.id,
        dealership_id: dealershipId,
        storage_path: path,
        is_primary: i === 0,
        sort_order: i + 1,
      });

      await trackFile(photos[i], "vehicle-images", path, dealershipId, userId, {
        sourceEntity: "vehicle",
        sourceEntityId: vehicle.id,
      });
    }

    await insertStatusHistory(supabase, {
      vehicleId: vehicle.id,
      dealershipId,
      fromStatus: null,
      toStatus: dbStatus,
      changedBy: userId,
      notes: "Wholesale vehicle added",
    });

    await insertVehicleAudit(supabase, {
      dealershipId,
      vehicleId: vehicle.id,
      action: "WHOLESALE_INSERT",
      changedBy: userId,
      newValues: { vin: data.vin, make: data.make, model: data.model },
    });

    await revalidateWholesaleInventoryPaths();
    return { success: true, vehicleId: vehicle.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add vehicle",
    };
  }
}
