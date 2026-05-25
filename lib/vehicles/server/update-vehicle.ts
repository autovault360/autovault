"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, uploadFile } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  vin: z.string().length(17),
  year: z.coerce.number(),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  mileage: z.coerce.number().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  driveType: z.string().optional(),
  fuelType: z.string().optional(),
  stockNumber: z.string().optional(),
  lotLocation: z.string().optional(),
  acquisitionDate: z.string().optional(),
  titleNumber: z.string().optional(),
  licensePlate: z.string().optional(),
  state: z.string().optional(),
  expirationDate: z.string().optional(),
  sellerAuction: z.string().optional(),
  purchaseType: z.string().optional(),
  acquisitionCost: z.coerce.number().positive(),
  askingPrice: z.coerce.number().positive(),
  marketValue: z.coerce.number().optional(),
  wholesalePrice: z.coerce.number().optional(),
  reconditioningCost: z.coerce.number().optional(),
  titleStatus: z.string().optional(),
  odometerStatus: z.string().optional(),
  notes: z.string().max(500).optional(),
  removedImages: z.array(z.string()).optional(),
});

export async function updateVehicle(formData: FormData) {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(supabase, data.vehicleId, dealershipId);
    if (activeError) return { success: false, error: activeError };

    const { data: existing } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .single();

    if (!existing) return { success: false, error: "Vehicle not found" };

    const reconditioningCost = data.reconditioningCost ?? 0;
    const totalInvested = data.acquisitionCost + reconditioningCost;

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        vin: data.vin,
        stock_number: data.stockNumber,
        make: data.make,
        model: data.model,
        trim: data.trim,
        year: data.year,
        body_style: data.bodyStyle,
        mileage: data.mileage,
        exterior_color: data.exteriorColor,
        interior_color: data.interiorColor,
        drivetrain: data.driveType,
        fuel_type: data.fuelType,
        lot_location: data.lotLocation,
        acquisition_date: data.acquisitionDate,
        acquisition_cost: data.acquisitionCost,
        asking_price: data.askingPrice,
        market_value: data.marketValue,
        wholesale_price: data.wholesalePrice,
        reconditioning_cost: reconditioningCost,
        total_invested: totalInvested,
        title_status: data.titleStatus,
        title_number: data.titleNumber,
        license_plate: data.licensePlate,
        state: data.state,
        expiration_date: data.expirationDate,
        seller_auction: data.sellerAuction,
        purchase_type: data.purchaseType,
        odometer_status: data.odometerStatus,
        notes: data.notes,
      })
      .eq("id", data.vehicleId);

    if (updateError) throw new Error(updateError.message);

    const removedImages = data.removedImages ?? [];
    if (removedImages.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("vehicle-images")
        .remove(removedImages);
      if (storageError) console.error("Failed to remove images from storage:", storageError.message);

      const { error: dbError } = await supabase
        .from("vehicle_images")
        .delete()
        .eq("vehicle_id", data.vehicleId)
        .in("storage_path", removedImages);
      if (dbError) console.error("Failed to remove image records:", dbError.message);
    }

    const photos = formData.getAll("photos") as File[];
    if (photos.length > 0) {
      const { data: maxSort } = await supabase
        .from("vehicle_images")
        .select("sort_order")
        .eq("vehicle_id", data.vehicleId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextSort = (maxSort?.sort_order ?? -1) + 1;
      for (let i = 0; i < photos.length; i++) {
        const ext = photos[i].name.split(".").pop();
        const path = `${dealershipId}/${data.vehicleId}/photos/${nextSort}.${ext}`;
        await uploadFile("vehicle-images", path, photos[i]);

        await supabase.from("vehicle_images").insert({
          vehicle_id: data.vehicleId,
          dealership_id: dealershipId,
          storage_path: path,
          is_primary: false,
          sort_order: nextSort,
        });
        nextSort++;
      }
    }

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "VEHICLE_UPDATED",
      new_values: { make: data.make, model: data.model, year: data.year, vin: data.vin },
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
