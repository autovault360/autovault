import type {
  VehicleCosts,
  VehicleStatus,
  WholesaleInventoryStatus,
  WholesalePaymentStatus,
  WholesaleTitleStatus,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import { totalVehicleCost } from "@/lib/dealer/dashboard/calculations";
import { mapDbTitleReceived } from "@/lib/vehicles/title-received";

export type VehicleDbRow = {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  stock_number?: string | null;
  mileage?: number | null;
  lot_location?: string | null;
  acquisition_date?: string | null;
  acquisition_cost?: number | null;
  market_value?: number | null;
  wholesale_price?: number | null;
  reconditioning_cost?: number | null;
  wholesale_auction_fees?: number | null;
  wholesale_transport_cost?: number | null;
  wholesale_storage_cost?: number | null;
  wholesale_dealer_fees?: number | null;
  status?: string | null;
  title_status?: string | null;
  title_received?: boolean | null;
  wholesale_payment_status?: string | null;
  sold_at?: string | null;
  sold_price?: number | null;
  title_missing_since?: string | null;
  times_in_auction?: number | null;
  next_auction_date?: string | null;
  last_auction_date?: string | null;
  condition?: string | null;
  odometer_status?: string | null;
  notes?: string | null;
  exterior_color?: string | null;
  arbitration_reason?: string | null;
  arbitration_listed_at?: string | null;
  arbitration_buyer_dealer?: string | null;
};

function formatISO(date: string | null | undefined): string {
  if (!date) return "";
  return date.split("T")[0];
}

function daysSince(date: string | null | undefined): number {
  if (!date) return 0;
  const parsed = new Date(`${formatISO(date)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export function mapDbInventoryStatus(
  dbStatus: string | null | undefined,
): WholesaleInventoryStatus {
  switch (dbStatus) {
    case "pending_sale":
      return "pending_sale";
    case "arbitration":
      return "arbitration";
    case "sold":
    case "loss":
      return "sold";
    case "in_stock":
    case "needs_attention":
    case "pending_deal":
    default:
      return "in_stock";
  }
}

export function mapDbTitleStatus(
  titleReceived: boolean | null | undefined,
  titleStatus: string | null | undefined,
): WholesaleTitleStatus {
  return mapDbTitleReceived(titleReceived, titleStatus) ? "received" : "missing";
}

export function mapDbPaymentStatus(
  paymentStatus: string | null | undefined,
  inventoryStatus: WholesaleInventoryStatus,
  titleStatus: WholesaleTitleStatus,
): WholesalePaymentStatus | undefined {
  if (paymentStatus === "paid" || paymentStatus === "on_hold" || paymentStatus === "partial") {
    return paymentStatus;
  }
  if (inventoryStatus === "sold" && titleStatus === "missing") {
    return "on_hold";
  }
  if (inventoryStatus === "sold") {
    return "paid";
  }
  return undefined;
}

export function toLegacyStatus(
  inventoryStatus: WholesaleInventoryStatus,
): VehicleStatus {
  switch (inventoryStatus) {
    case "pending_sale":
      return "pending";
    case "arbitration":
      return "pending";
    case "sold":
      return "sold";
    default:
      return "in_inventory";
  }
}

export function buildVehicleCosts(row: VehicleDbRow): VehicleCosts {
  return {
    acquisition: Number(row.acquisition_cost ?? 0),
    auction: Number(row.wholesale_auction_fees ?? 0),
    transport: Number(row.wholesale_transport_cost ?? 0),
    recon: Number(row.reconditioning_cost ?? 0),
    storage: Number(row.wholesale_storage_cost ?? 0),
    dealerFees: Number(row.wholesale_dealer_fees ?? 0),
  };
}

export function mapWholesaleVehicle(
  row: VehicleDbRow,
  imageUrl?: string,
): WholesaleVehicle {
  const costs = buildVehicleCosts(row);
  const inventoryStatus = mapDbInventoryStatus(row.status);
  const titleStatus = mapDbTitleStatus(row.title_received, row.title_status);
  const wholesaleValue = Number(
    row.wholesale_price ?? row.market_value ?? 0,
  );
  const totalCost = totalVehicleCost(costs);
  const soldPrice = row.sold_price != null ? Number(row.sold_price) : undefined;
  const profit =
    soldPrice != null ? soldPrice - totalCost : wholesaleValue - totalCost;

  return {
    id: row.id,
    vin: row.vin,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim ?? undefined,
    stockNumber: row.stock_number ?? "",
    mileage: row.mileage ?? undefined,
    costs,
    marketValue: Number(row.market_value ?? wholesaleValue),
    wholesaleValue,
    status: toLegacyStatus(inventoryStatus),
    inventoryStatus,
    titleStatus,
    paymentStatus: mapDbPaymentStatus(
      row.wholesale_payment_status,
      inventoryStatus,
      titleStatus,
    ),
    condition:
      row.condition === "excellent" ||
      row.condition === "good" ||
      row.condition === "fair"
        ? row.condition
        : undefined,
    location: row.lot_location ?? "",
    daysInLot: daysSince(row.acquisition_date),
    purchaseDate: formatISO(row.acquisition_date),
    imageUrl,
    soldPrice,
    profit,
    soldAt: formatISO(row.sold_at),
    titleMissingSince: formatISO(row.title_missing_since),
    daysSinceTitlePending: row.title_missing_since
      ? daysSince(row.title_missing_since)
      : undefined,
    timesInAuction: row.times_in_auction ?? 0,
    nextAuctionDate: formatISO(row.next_auction_date),
    lastAuctionDate: formatISO(row.last_auction_date),
    odometerStatus: row.odometer_status ?? undefined,
    notes: row.notes ?? undefined,
    exteriorColor: row.exterior_color ?? undefined,
    arbitrationReason: row.arbitration_reason ?? undefined,
    arbitrationListedAt: formatISO(row.arbitration_listed_at),
    arbitrationBuyerDealer: row.arbitration_buyer_dealer ?? undefined,
  };
}

export function withWholesaleVehicleDefaults(
  vehicle: Omit<
    WholesaleVehicle,
    "wholesaleValue" | "inventoryStatus" | "titleStatus" | "location"
  > &
    Partial<
      Pick<
        WholesaleVehicle,
        "wholesaleValue" | "inventoryStatus" | "titleStatus" | "location"
      >
    >,
): WholesaleVehicle {
  const inventoryStatus =
    vehicle.inventoryStatus ??
    (vehicle.status === "sold"
      ? "sold"
      : vehicle.status === "pending"
        ? "pending_sale"
        : "in_stock");

  return {
    ...vehicle,
    wholesaleValue: vehicle.wholesaleValue ?? vehicle.marketValue,
    location: vehicle.location ?? "",
    inventoryStatus,
    titleStatus: vehicle.titleStatus ?? "received",
  };
}

export function getVehicleLabel(vehicle: WholesaleVehicle): string {
  const base = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return vehicle.trim ? `${base} ${vehicle.trim}` : base;
}
