"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, uploadFile, trackFile, rollbackVehicle } from "./utils";
import { resolveTitleReceivedFields } from "@/lib/vehicles/title-received";
import { revalidatePath } from "next/cache";

const schema = z.object({
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
  titleReceived: z.boolean(),
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
  odometerStatus: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type AddVehicleResult =
  | { success: true; vehicleId: string }
  | { success: false; error: string };

export async function addVehicle(
  formData: FormData,
): Promise<AddVehicleResult> {
  const uploadedPaths: string[] = [];

  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const reconditioningCost = data.reconditioningCost ?? 0;
    const totalInvested = data.acquisitionCost + reconditioningCost;
    const titleFields = resolveTitleReceivedFields(data.titleReceived);

    const supabase = await createClient();

    const { data: vehicle, error: insertError } = await supabase
      .from("vehicles")
      .insert({
        dealership_id: dealershipId,
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
        ...titleFields,
        license_plate: data.licensePlate,
        state: data.state,
        expiration_date: data.expirationDate,
        seller_auction: data.sellerAuction,
        purchase_type: data.purchaseType,
        odometer_status: data.odometerStatus,
        notes: data.notes,
        status: "in_stock",
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
      const ext = photos[i].name.split(".").pop();
      const path = `${dealershipId}/${vehicle.id}/photos/${i}.${ext}`;
      await uploadFile("vehicle-images", path, photos[i]);
      uploadedPaths.push(path);

      const { error: imageError } = await supabase.from("vehicle_images").insert({
        vehicle_id: vehicle.id,
        dealership_id: dealershipId,
        storage_path: path,
        is_primary: i === 0,
        sort_order: i + 1,
      });
      if (imageError) {
        throw new Error(`Failed to save vehicle image metadata: ${imageError.message}`);
      }

      await trackFile(photos[i], "vehicle-images", path, dealershipId, userId, {
        sourceEntity: "vehicle",
        sourceEntityId: vehicle.id,
      });
    }

    await supabase.from("status_history").insert({
      vehicle_id: vehicle.id,
      dealership_id: dealershipId,
      from_status: null,
      to_status: "in_stock",
      changed_by: userId,
    });

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: vehicle.id,
      action: "INSERT",
      new_values: { vin: data.vin, make: data.make, model: data.model },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dealer/dashboard");
    revalidatePath("/dealer/inventory");
    revalidatePath("/dealer/dashboard/missing-titles");
    revalidatePath("/sales-rep/dashboard/inventory");
    return { success: true, vehicleId: vehicle.id };
  } catch (err) {
    if (uploadedPaths.length > 0 && err instanceof Error) {
      const vehicleId = uploadedPaths[0].split("/")[1];
      await rollbackVehicle(vehicleId, uploadedPaths, "vehicle-images");
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
