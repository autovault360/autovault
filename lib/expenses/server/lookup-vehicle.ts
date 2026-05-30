"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { lookupVehicleSchema } from "./schemas";
import type { LinkedVehicleResult } from "./types";
import { mapVehicleStatus } from "./types";

export type LookupVehicleResult =
  | { success: true; vehicle: LinkedVehicleResult }
  | { success: false; error: string };

async function getPrimaryImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vehicleId: string,
  dealershipId: string,
): Promise<string> {
  const { data: images } = await supabase
    .from("vehicle_images")
    .select("storage_path, is_primary, sort_order")
    .eq("vehicle_id", vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1);

  const path = images?.[0]?.storage_path;
  if (!path) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=240&q=80";
  }

  const { data } = await supabase.storage
    .from("vehicle-images")
    .createSignedUrl(path, 3600);

  return data?.signedUrl ?? "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=240&q=80";
}

function mapRow(
  row: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    stock_number: string | null;
    vin: string;
    mileage: number | null;
    exterior_color: string | null;
    status: string;
  },
  imageUrl: string,
): LinkedVehicleResult {
  return {
    id: row.id,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim ?? "",
    stockNumber: row.stock_number ?? "—",
    vin: row.vin,
    mileage: row.mileage ?? 0,
    color: row.exterior_color ?? "—",
    status: mapVehicleStatus(row.status),
    image: imageUrl,
  };
}

export async function lookupVehicle(
  input: unknown,
): Promise<LookupVehicleResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const params = lookupVehicleSchema.parse(input);
    const supabase = await createClient();
    const { dealershipId } = auth.user;

    let query = supabase
      .from("vehicles")
      .select(
        "id, year, make, model, trim, stock_number, vin, mileage, exterior_color, status",
      )
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null);

    if (params.mode === "vin") {
      query = query.eq("vin", params.query.trim().toUpperCase());
    } else if (params.mode === "stock") {
      query = query.ilike("stock_number", params.query.trim());
    } else {
      query = query
        .eq("year", params.year)
        .ilike("make", params.make.trim())
        .ilike("model", params.model.trim());
    }

    const { data: row, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { success: false, error: "No vehicle found" };

    const imageUrl = await getPrimaryImageUrl(supabase, row.id, dealershipId);
    return { success: true, vehicle: mapRow(row, imageUrl) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return { success: false, error: message };
  }
}
