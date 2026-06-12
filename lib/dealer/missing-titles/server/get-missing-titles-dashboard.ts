import { createClient } from "@/lib/supabase/server";
import { authenticateWholesaleDealer } from "@/lib/dealer/inventory/server/utils";
import {
  mapWholesaleVehicle,
  type VehicleDbRow,
} from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type {
  MissingTitleRecord,
  MissingTitlesDashboardData,
  MissingTitleStatus,
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

function deriveWorkflowStatus(daysMissing: number): MissingTitleStatus {
  if (daysMissing >= 90) return "overdue";
  if (daysMissing >= 30) return "in_progress";
  return "pending";
}

function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
}

export async function getMissingTitlesDashboard(): Promise<MissingTitlesDashboardData> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) {
    return {
      records: [],
      stats: {
        totalMissing: 0,
        totalMissingDelta: "0 vs last month",
        over30Days: 0,
        over30DaysDelta: "0 vs last month",
        over60Days: 0,
        over60DaysDelta: "0 vs last month",
        over90Days: 0,
        over90DaysDelta: "No change",
        avgDaysMissing: 0,
        avgDaysMissingDelta: "0 vs last month",
      },
      locations: [],
    };
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("vehicles")
    .select("*, images:vehicle_images(storage_path, is_primary, sort_order)")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("title_received", false)
    .is("deleted_at", null)
    .order("title_missing_since", { ascending: true });

  if (error || !rows) {
    console.error("getMissingTitlesDashboard:", error?.message);
    return {
      records: [],
      stats: {
        totalMissing: 0,
        totalMissingDelta: "0 vs last month",
        over30Days: 0,
        over30DaysDelta: "0 vs last month",
        over60Days: 0,
        over60DaysDelta: "0 vs last month",
        over90Days: 0,
        over90DaysDelta: "No change",
        avgDaysMissing: 0,
        avgDaysMissingDelta: "0 vs last month",
      },
      locations: [],
    };
  }

  const records: MissingTitleRecord[] = [];

  for (const row of rows) {
    const r = row as VehicleDbRow & {
      images?: { storage_path: string; is_primary: boolean; sort_order: number }[];
      updated_at?: string;
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
    const daysMissing =
      mapped.daysSinceTitlePending ?? daysSince(r.title_missing_since);

    records.push({
      id: mapped.id,
      vin: mapped.vin,
      stockNumber: mapped.stockNumber,
      year: mapped.year,
      make: mapped.make,
      model: mapped.model,
      trim: mapped.trim,
      imageUrl: mapped.imageUrl,
      dateAcquired: mapped.purchaseDate,
      daysMissing,
      reason: mapped.notes?.slice(0, 80) || "Title not received",
      lastUpdate: formatDisplayDate(r.updated_at?.split("T")[0]),
      status: deriveWorkflowStatus(daysMissing),
      location: mapped.location || "Unknown",
    });
  }

  const over30 = records.filter((r) => r.daysMissing >= 30).length;
  const over60 = records.filter((r) => r.daysMissing >= 60).length;
  const over90 = records.filter((r) => r.daysMissing >= 90).length;
  const avgDaysMissing =
    records.length > 0
      ? Math.round(
          records.reduce((sum, r) => sum + r.daysMissing, 0) / records.length,
        )
      : 0;

  const locations = [...new Set(records.map((r) => r.location))].sort();

  return {
    records,
    stats: {
      totalMissing: records.length,
      totalMissingDelta: `${records.length} active`,
      over30Days: over30,
      over30DaysDelta: `${over30} vehicles`,
      over60Days: over60,
      over60DaysDelta: `${over60} vehicles`,
      over90Days: over90,
      over90DaysDelta: over90 === 0 ? "No change" : `${over90} vehicles`,
      avgDaysMissing,
      avgDaysMissingDelta: `${avgDaysMissing} days avg`,
    },
    locations,
  };
}
