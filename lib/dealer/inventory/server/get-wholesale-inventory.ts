"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateWholesaleDealer } from "./utils";
import {
  mapWholesaleVehicle,
  type VehicleDbRow,
} from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";

async function resolveImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: { storage_path: string; is_primary: boolean; sort_order: number }[],
): Promise<string | undefined> {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return Number(b.is_primary) - Number(a.is_primary);
    }
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  if (!sorted[0]) return undefined;
  try {
    const { data, error } = await supabase.storage
      .from("vehicle-images")
      .createSignedUrl(sorted[0].storage_path, 3600);
    if (error || !data) return undefined;
    return data.signedUrl;
  } catch {
    return undefined;
  }
}

export async function getWholesaleInventory(): Promise<WholesaleVehicle[]> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("vehicles")
    .select("*, images:vehicle_images(storage_path, is_primary, sort_order)")
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !rows) {
    console.error("getWholesaleInventory:", error?.message);
    return [];
  }

  const vehicles: WholesaleVehicle[] = [];
  for (const row of rows) {
    const r = row as VehicleDbRow & {
      images?: { storage_path: string; is_primary: boolean; sort_order: number }[];
    };
    const imageUrl = await resolveImageUrl(supabase, r.images ?? []);
    vehicles.push(mapWholesaleVehicle(r, imageUrl));
  }

  return vehicles;
}

export async function getWholesaleVehicleById(
  vehicleId: string,
): Promise<WholesaleVehicle | null> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return null;

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("vehicles")
    .select("*, images:vehicle_images(storage_path, is_primary, sort_order)")
    .eq("id", vehicleId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !row) return null;

  const r = row as VehicleDbRow & {
    images?: { storage_path: string; is_primary: boolean; sort_order: number }[];
  };
  const imageUrl = await resolveImageUrl(supabase, r.images ?? []);
  return mapWholesaleVehicle(r, imageUrl);
}
