import { createClient } from "@/lib/supabase/server";
import { authenticateWholesaleDealer } from "@/lib/dealer/inventory/server/utils";
import {
  mapWholesaleVehicle,
  type VehicleDbRow,
} from "@/lib/dealer/inventory/map-wholesale-vehicle";
import {
  computeArbitrationStats,
  type ArbitrationDashboardData,
  type ArbitrationRecord,
} from "../types";

function daysSince(date: string | null | undefined): number {
  if (!date) return 0;
  const parsed = new Date(`${date.split("T")[0]}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function formatISO(date: string | null | undefined): string {
  if (!date) return "";
  return date.split("T")[0];
}

const emptyStats = computeArbitrationStats([]);

export async function getArbitrationDashboard(): Promise<ArbitrationDashboardData> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) {
    return { records: [], stats: emptyStats, dealers: [], reasons: [] };
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("vehicles")
    .select("*, images:vehicle_images(storage_path, is_primary, sort_order)")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("status", "arbitration")
    .is("deleted_at", null)
    .order("arbitration_listed_at", { ascending: false });

  if (error || !rows) {
    console.error("getArbitrationDashboard:", error?.message);
    return { records: [], stats: emptyStats, dealers: [], reasons: [] };
  }

  const vehicleIds = rows.map((row) => row.id as string);
  const notesByVehicle = new Map<
    string,
    { count: number; latestPreview: string }
  >();

  if (vehicleIds.length > 0) {
    const { data: noteRows } = await supabase
      .from("arbitration_notes")
      .select("vehicle_id, body, created_at")
      .in("vehicle_id", vehicleIds)
      .eq("dealership_id", auth.user.dealershipId)
      .order("created_at", { ascending: false });

    for (const note of noteRows ?? []) {
      const vehicleId = note.vehicle_id as string;
      const existing = notesByVehicle.get(vehicleId);
      if (!existing) {
        notesByVehicle.set(vehicleId, {
          count: 1,
          latestPreview: (note.body as string).slice(0, 80),
        });
      } else {
        existing.count += 1;
      }
    }
  }

  const records: ArbitrationRecord[] = [];

  for (const row of rows) {
    const r = row as VehicleDbRow & {
      images?: { storage_path: string; is_primary: boolean; sort_order: number }[];
    };

    let imageUrl: string | undefined;
    const images = r.images ?? [];
    const primary = images.find((img) => img.is_primary) ?? images[0];
    if (primary) {
      try {
        const { data } = await supabase.storage
          .from("vehicle-images")
          .createSignedUrl(primary.storage_path, 3600);
        imageUrl = data?.signedUrl;
      } catch {
        imageUrl = undefined;
      }
    }

    const mapped = mapWholesaleVehicle(r, imageUrl);
    const noteMeta = notesByVehicle.get(mapped.id);
    const dateListed =
      mapped.arbitrationListedAt || mapped.purchaseDate || formatISO(r.arbitration_listed_at);

    records.push({
      id: mapped.id,
      vin: mapped.vin,
      stockNumber: mapped.stockNumber,
      year: mapped.year,
      make: mapped.make,
      model: mapped.model,
      trim: mapped.trim,
      exteriorColor: mapped.exteriorColor,
      imageUrl: mapped.imageUrl,
      buyerDealer: mapped.arbitrationBuyerDealer || "�€”",
      arbitrationReason: mapped.arbitrationReason || "Not specified",
      dateListed,
      daysInArbitration: daysSince(dateListed),
      latestNotePreview: noteMeta?.latestPreview || "�€”",
      noteCount: noteMeta?.count ?? 0,
      location: mapped.location || "Unknown",
    });
  }

  const dealers = [
    ...new Set(records.map((r) => r.buyerDealer).filter((d) => d !== "�€”")),
  ].sort();
  const reasons = [
    ...new Set(records.map((r) => r.arbitrationReason)),
  ].sort();

  return {
    records,
    stats: computeArbitrationStats(records),
    dealers,
    reasons,
  };
}
