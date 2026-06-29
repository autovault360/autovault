"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, uploadFile, trackFile } from "./utils";
import { resolveTitleReceivedFields } from "@/lib/vehicles/title-received";
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
  titleReceived: z.boolean(),
  licensePlate: z.string().optional(),
  state: z.string().optional(),
  expirationDate: z.string().optional(),
  sellerAuction: z.string().optional(),
  purchaseType: z.string().optional(),
  acquisitionCost: z.coerce.number().positive(),
  registrationFees: z.coerce.number().min(0).optional(),
  auctionFees: z.coerce.number().min(0).optional(),
  askingPrice: z.coerce.number().positive(),
  marketValue: z.coerce.number().optional(),
  wholesalePrice: z.coerce.number().optional(),
  reconditioningCost: z.coerce.number().optional(),
  odometerStatus: z.string().optional(),
  notes: z.string().max(500).optional(),
  removedImages: z.array(z.string()).optional(),
  imageOrder: z.array(
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("existing"), path: z.string() }),
      z.object({ type: z.literal("new") }),
    ]),
  ).optional(),
});

async function softDeleteVehicleImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string,
  storagePaths: string[],
) {
  if (!storagePaths.length) return;

  const { error: storageError } = await supabase.storage
    .from("vehicle-images")
    .remove(storagePaths);
  if (storageError) console.error("Failed to remove images from storage:", storageError.message);

  for (const path of storagePaths) {
    const { error } = await supabase
      .from("vehicle_images")
      .update({ deleted_at: new Date().toISOString() })
      .eq("vehicle_id", vehicleId)
      .eq("storage_path", path)
      .is("deleted_at", null);
    if (error) throw new Error(`Failed to remove image records: ${error.message}`);
  }
}

export async function updateVehicle(formData: FormData) {
  const uploadedPaths: string[] = [];
  let vehicleId: string | null = null;

  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId } = auth.user;

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);
    vehicleId = data.vehicleId;

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
    const registrationFees = data.registrationFees ?? 0;
    const auctionFees = data.auctionFees ?? 0;
    const totalInvested = data.acquisitionCost + registrationFees + auctionFees + reconditioningCost;
    const titleFields = resolveTitleReceivedFields(
      data.titleReceived,
      existing.title_missing_since as string | null | undefined,
    );

    const { data: updatedRow, error: updateError } = await supabase
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
        acquisition_date: data.acquisitionDate || null,
        acquisition_cost: data.acquisitionCost,
        registration_fees: registrationFees,
        auction_fees: auctionFees,
        asking_price: data.askingPrice,
        market_value: data.marketValue,
        wholesale_price: data.wholesalePrice,
        reconditioning_cost: reconditioningCost,
        total_invested: totalInvested,
        ...titleFields,
        license_plate: data.licensePlate || null,
        state: data.state || null,
        expiration_date: data.expirationDate || null,
        seller_auction: data.sellerAuction || null,
        purchase_type: data.purchaseType || null,
        odometer_status: data.odometerStatus || null,
        notes: data.notes || null,
      })
      .eq("id", data.vehicleId)
      .eq("dealership_id", dealershipId)
      .select("id")
      .single();

    if (updateError) {
      const message = updateError.message?.includes("uq_vehicle_vin")
        ? "A vehicle with this VIN already exists in your dealership"
        : updateError.message;
      throw new Error(message);
    }

    if (!updatedRow) {
      throw new Error("Vehicle not found or update was not permitted");
    }

    const photos = formData.getAll("photos") as File[];
    const imageOrder = data.imageOrder ?? [];

    if (imageOrder.length > 0) {
      let newPhotoIndex = 0;
      const uploadedNewPaths: string[] = [];

      for (const entry of imageOrder) {
        if (entry.type !== "new") continue;
        const file = photos[newPhotoIndex++];
        if (!file) continue;

        const ext = file.name.split(".").pop();
        const path = `${dealershipId}/${data.vehicleId}/photos/${Date.now()}-${newPhotoIndex}.${ext}`;
        await uploadFile("vehicle-images", path, file);
        uploadedNewPaths.push(path);
        uploadedPaths.push(path);

        await trackFile(file, "vehicle-images", path, dealershipId, userId, {
          sourceEntity: "vehicle",
          sourceEntityId: data.vehicleId,
        });
      }

      newPhotoIndex = 0;
      const orderedPaths: string[] = [];
      for (const entry of imageOrder) {
        if (entry.type === "existing") {
          orderedPaths.push(entry.path);
        } else {
          const path = uploadedNewPaths[newPhotoIndex++];
          if (path) orderedPaths.push(path);
        }
      }

      const keepSet = new Set(orderedPaths);
      const { data: activeImages } = await supabase
        .from("vehicle_images")
        .select("storage_path")
        .eq("vehicle_id", data.vehicleId)
        .is("deleted_at", null);

      const pathsToRemove = (activeImages ?? [])
        .map((row) => row.storage_path)
        .filter((path) => !keepSet.has(path));

      await softDeleteVehicleImages(supabase, data.vehicleId, pathsToRemove);

      for (let i = 0; i < orderedPaths.length; i++) {
        const path = orderedPaths[i];
        const { data: existingImage } = await supabase
          .from("vehicle_images")
          .select("id")
          .eq("vehicle_id", data.vehicleId)
          .eq("storage_path", path)
          .is("deleted_at", null)
          .maybeSingle();

        if (existingImage) {
          const { error: orderError } = await supabase
            .from("vehicle_images")
            .update({ sort_order: i, is_primary: i === 0 })
            .eq("id", existingImage.id);
          if (orderError) throw new Error(`Failed to update image order: ${orderError.message}`);
        } else {
          const { error: insertError } = await supabase.from("vehicle_images").insert({
            vehicle_id: data.vehicleId,
            dealership_id: dealershipId,
            storage_path: path,
            is_primary: i === 0,
            sort_order: i,
          });
          if (insertError) throw new Error(`Failed to insert image: ${insertError.message}`);
        }
      }
    } else {
      const removedImages = data.removedImages ?? [];
      if (removedImages.length > 0) {
        await softDeleteVehicleImages(supabase, data.vehicleId, removedImages);
      } else if (photos.length > 0) {
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
          uploadedPaths.push(path);

          await trackFile(photos[i], "vehicle-images", path, dealershipId, userId, {
            sourceEntity: "vehicle",
            sourceEntityId: data.vehicleId,
          });

          const { error: insertError } = await supabase.from("vehicle_images").insert({
            vehicle_id: data.vehicleId,
            dealership_id: dealershipId,
            storage_path: path,
            is_primary: false,
            sort_order: nextSort,
          });
          if (insertError) {
            throw new Error(`Failed to insert image: ${insertError.message}`);
          }
          nextSort++;
        }
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
    revalidatePath(`/dashboard/vehicles/${data.vehicleId}`);
    return { success: true };
  } catch (err) {
    if (uploadedPaths.length > 0) {
      const supabase = await createClient();
      await supabase.storage.from("vehicle-images").remove(uploadedPaths);
      if (vehicleId) {
        await supabase
          .from("vehicle_images")
          .update({ deleted_at: new Date().toISOString() })
          .eq("vehicle_id", vehicleId)
          .in("storage_path", uploadedPaths)
          .is("deleted_at", null);
      }
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
