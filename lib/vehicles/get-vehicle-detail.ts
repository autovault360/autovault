import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type {
  VehicleDetail,
  VehicleExpense,
  ActivityLogEntry,
} from "./detail-types";
import { formatField, type VehicleStatus } from "./types";
import { mapDbVehicleStatus } from "./map-db-status";
import { authenticateUser } from "./server/utils";
import { mapDbTitleReceived } from "./title-received";

function mapStatus(dbStatus: string): VehicleStatus {
  return mapDbVehicleStatus(dbStatus);
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatISO(date: string | null | undefined): string {
  if (!date) return "";
  return date.split("T")[0];
}

function daysSince(date: string | null | undefined): number {
  if (!date) return 0;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

type DbVehicleRow = {
  id: string;
  vin: string;
  stock_number: string | null;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  body_style: string | null;
  mileage: number | null;
  exterior_color: string | null;
  interior_color: string | null;
  drivetrain: string | null;
  engine: string | null;
  transmission: string | null;
  fuel_type: string | null;
  doors: number | null;
  mpg: string | null;
  lot_location: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  asking_price: number | null;
  market_value: number | null;
  title_status: string | null;
  title_received: boolean | null;
  license_plate: string | null;
  state: string | null;
  expiration_date: string | null;
  seller_auction: string | null;
  purchase_type: string | null;
  odometer_status: string | null;
  wholesale_price: number | null;
  reconditioning_cost: number | null;
  total_invested: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  images?: { storage_path: string; is_primary: boolean; sort_order: number; deleted_at?: string | null }[];
  expenses?: {
    total_cost: number;
    category: string;
    created_at: string;
    description?: string;
    shop_vendor?: string | null;
    expense_subcategory?: string | null;
    receipt_storage_path?: string | null;
    repair_type?: string;
  }[];
  status_history?: { from_status: string | null; to_status: string; created_at: string; notes?: string }[];
  pricing_history?: { previous_price: number | null; new_price: number; reason: string; created_at: string }[];
};

async function getImageUrls(
  supabase: SupabaseClient,
  images: { storage_path: string; is_primary: boolean; sort_order: number }[],
): Promise<{ urls: string[]; paths: string[] }> {
  const urls: string[] = [];
  const paths: string[] = [];
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return Number(b.is_primary) - Number(a.is_primary);
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  for (const img of sorted) {
    try {
      const { data, error } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(img.storage_path, 3600);
      if (!error && data?.signedUrl) {
        urls.push(data.signedUrl);
        paths.push(img.storage_path);
      }
    } catch {
      // Skip orphaned records where storage file no longer exists
    }
  }
  return { urls, paths };
}

export async function getVehicleDetail(id: string): Promise<VehicleDetail | null> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) {
      console.warn("getVehicleDetail: auth failed", auth.error);
      return null;
    }
    const { dealershipId } = auth.user;

    const supabase = await createClient();

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        images:vehicle_images(storage_path, is_primary, sort_order, deleted_at),
        expenses:vehicle_expenses(
          total_cost,
          category,
          created_at,
          description,
          shop_vendor,
          expense_subcategory,
          receipt_storage_path,
          repair_type
        ),
        status_history(from_status, to_status, created_at, notes),
        pricing_history(previous_price, new_price, reason, created_at)
      `)
      .eq("id", id)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .single();

    if (error || !vehicle) {
      if (error) console.warn("getVehicleDetail: query error", error.message);
      return null;
    }

    const { data: auditRows } = await supabase
      .from("audit_logs")
      .select("action, new_values, created_at")
      .eq("entity_id", id)
      .eq("dealership_id", dealershipId)
      .order("created_at", { ascending: false });

    const row = vehicle as unknown as DbVehicleRow;
    const askingPrice = Number(row.asking_price ?? 0);
    const acquisitionCost = Number(row.acquisition_cost ?? 0);
    const marketValue = Number(row.market_value ?? 0);
    const sumOfExpenses = (row.expenses ?? []).reduce(
      (sum, e) => sum + Number(e.total_cost),
      0,
    );
    const totalReconditioning = Math.max(Number(row.reconditioning_cost ?? 0), sumOfExpenses);
    const grossProfit = askingPrice - acquisitionCost;
    const grossProfitPct = acquisitionCost > 0
      ? (grossProfit / acquisitionCost) * 100
      : 0;

    const activeImages = (row.images ?? []).filter((img) => !img.deleted_at);
    const sortedImages = [...activeImages].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return Number(b.is_primary) - Number(a.is_primary);
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    const { urls: imagesWithUrls, paths: imageStoragePaths } = await getImageUrls(
      supabase,
      sortedImages,
    );

    const expenses: VehicleExpense[] = (row.expenses ?? []).map((e) => {
      const sub = e.expense_subcategory ?? e.repair_type ?? e.category;
      const vendor = e.shop_vendor ? ` .. ${e.shop_vendor}` : "";
      return {
        label: e.description
          ? `${sub}${vendor} - ${formatDate(e.created_at)}`
          : `${sub} - ${formatDate(e.created_at)}`,
        amount: Number(e.total_cost),
      };
    });

    const logEntries: { ts: string; entry: ActivityLogEntry }[] = [];

    for (const h of row.status_history ?? []) {
      logEntries.push({
        ts: h.created_at,
        entry: {
          title: `Status changed to ${h.to_status.replace("_", " ")}`,
          timestamp: formatDateTime(h.created_at),
          description: h.notes ?? `Changed from ${h.from_status ?? "new"} to ${h.to_status.replace("_", " ")}`,
          color: h.to_status === "sold" ? "emerald" : h.to_status === "loss" ? "red" : "blue",
          icon: h.to_status === "sold" ? "check-circle" : h.to_status === "loss" ? "alert-circle" : "car",
          details: { from_status: h.from_status, to_status: h.to_status, notes: h.notes ?? null },
        },
      });
    }

    for (const p of row.pricing_history ?? []) {
      logEntries.push({
        ts: p.created_at,
        entry: {
          title: "Price updated",
          timestamp: formatDateTime(p.created_at),
          description: `$${Number(p.previous_price ?? 0).toLocaleString()} ... $${Number(p.new_price).toLocaleString()} (${p.reason})`,
          color: "blue",
          icon: "dollar-sign",
          details: {
            previous_price: p.previous_price,
            new_price: p.new_price,
            reason: p.reason,
          },
        },
      });
    }

    for (const a of auditRows ?? []) {
      if (a.action === "PRICE_UPDATE") continue;
      const titleMap: Record<string, string> = {
        INSERT: "Vehicle added",
        REPAIR_ADDED: "Repair cost added",
        MARKED_SOLD: "Vehicle sold",
        MARKED_LOSS: "Vehicle marked as loss",
      };
      const details = a.new_values as Record<string, unknown> | null;
      let description = "";
      if (details) {
        switch (a.action) {
          case "INSERT":
            description = `VIN: ${details.vin ?? "N/A"} ... ${formatField("make", (details.make as string) ?? "")} ${formatField("model", (details.model as string) ?? "", details.make as string)}`;
            break;
          case "MARKED_SOLD":
            description = `Sold to ${details.customer_name ?? "N/A"} for $${Number(details.sale_price ?? 0).toLocaleString()}`;
            break;
          case "MARKED_LOSS":
            description = `${details.loss_reason ?? "N/A"} ... Net loss: $${Number(details.net_loss ?? 0).toLocaleString()}`;
            break;
          case "REPAIR_ADDED":
            description = `${details.repair_category ?? "Repair"}: $${Number(details.total_cost ?? 0).toLocaleString()}`;
            break;
          case "VEHICLE_UPDATED":
            description = `${formatField("make", (details.make as string) ?? "")} ${formatField("model", (details.model as string) ?? "", details.make as string)} (${details.year ?? ""})`;
            break;
          default:
            description = JSON.stringify(details).slice(0, 100);
        }
      }
      logEntries.push({
        ts: a.created_at,
        entry: {
          title: titleMap[a.action] ?? a.action.replace("_", " "),
          timestamp: formatDateTime(a.created_at),
          description,
          color: a.action === "MARKED_SOLD" ? "emerald" : a.action === "MARKED_LOSS" ? "red" : a.action === "REPAIR_ADDED" ? "orange" : "blue",
          icon: a.action === "MARKED_SOLD" ? "check-circle" : a.action === "MARKED_LOSS" ? "alert-circle" : a.action === "REPAIR_ADDED" ? "receipt" : "car",
          details,
        },
      });
    }

    logEntries.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    const activityLog = logEntries.map((e) => e.entry);

    const status = mapStatus(row.status);

    return {
      id: row.id,
      image: imagesWithUrls[0] ?? "",
      make: row.make,
      model: row.model,
      trim: row.trim ?? "",
      year: row.year,
      stockNumber: row.stock_number ?? "",
      vin: row.vin,
      mileage: row.mileage ?? 0,
      price: askingPrice,
      cost: acquisitionCost,
      daysInInventory: daysSince(row.acquisition_date),
      status,
      location: row.lot_location ?? "",
      arrivalDate: formatISO(row.acquisition_date),
      images: imagesWithUrls,
      imageStoragePaths,
      bodyStyle: row.body_style ?? "",
      exteriorColor: row.exterior_color ?? "",
      interiorColor: row.interior_color ?? "",
      doors: row.doors ?? 0,
      drivetrain: row.drivetrain ?? "",
      engine: row.engine ?? "",
      transmission: row.transmission ?? "",
      fuelType: row.fuel_type ?? "",
      mpg: row.mpg ?? "",
      marketValue,
      features: [],
      expenses,
      dateAcquired: formatDate(row.acquisition_date),
      acquisitionCost,
      titleReceived: mapDbTitleReceived(row.title_received, row.title_status),
      titleStatus: mapDbTitleReceived(row.title_received, row.title_status)
        ? "received"
        : "missing",
      licensePlate: row.license_plate ?? "",
      state: row.state ?? "",
      expirationDate: formatISO(row.expiration_date),
      sellerAuction: row.seller_auction ?? "",
      purchaseType: row.purchase_type ?? "",
      odometerStatus: row.odometer_status ?? "",
      wholesalePrice: row.wholesale_price ?? 0,
      lastUpdated: formatDate(row.updated_at),
      notes: row.notes ?? "",
      comparables: [],
      activityLog,
      totalReconditioning,
      grossProfit,
      grossProfitPct,
      displayTitle: `${row.year} ${formatField("make", row.make)} ${formatField("model", row.model, row.make)}${row.trim ? " " + row.trim : ""}`,
    };
  } catch {
    return null;
  }
}

export function getVehicleById(id: string): VehicleDetail | undefined {
  throw new Error("getVehicleById is no longer sync. Use getVehicleDetail instead.");
}
