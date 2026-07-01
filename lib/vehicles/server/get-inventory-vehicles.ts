"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { mapDbVehicleStatus } from "@/lib/vehicles/map-db-status";
import { mapDbTitleReceived } from "@/lib/vehicles/title-received";
import { daysBetween } from "@/services/flooring.service";
import type { InventoryVehicle } from "@/lib/vehicles/inventory-calculations";
import { isInCurrentMonth } from "@/lib/vehicles/inventory-calculations";

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

type DealRow = {
  sale_date: string;
  sales_tax_amount: number | null;
  license_fees: number | null;
  commission_amount: number | null;
  commission_rate: number | null;
  net_profit: number | null;
  roi_percent: number | null;
  sold_price_before_tax: number | null;
  sales_rep: { full_name: string | null; image_url: string | null } | { full_name: string | null; image_url: string | null }[] | null;
};

type VehicleRow = {
  id: string;
  vin: string;
  stock_number: string | null;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  mileage: number | null;
  lot_location: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  registration_fees: number | null;
  auction_fees: number | null;
  flooring_fees: number | null;
  flooring_start_date: string | null;
  asking_price: number | null;
  reconditioning_cost: number | null;
  total_invested: number | null;
  title_received: boolean | null;
  title_status: string | null;
  status: string;
  images?: { storage_path: string; is_primary: boolean; sort_order: number }[];
  deals: DealRow | DealRow[] | null;
};

async function getPrimaryImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: VehicleRow["images"],
): Promise<string> {
  const sorted = [...(images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return Number(b.is_primary) - Number(a.is_primary);
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  if (!sorted[0]) return "";

  try {
    const { data, error } = await supabase.storage
      .from("vehicle-images")
      .createSignedUrl(sorted[0].storage_path, 3600);
    return error || !data ? "" : data.signedUrl;
  } catch {
    return "";
  }
}

function resolveSalesRep(
  rep: DealRow["sales_rep"],
): { full_name: string | null; image_url: string | null } | null {
  if (!rep) return null;
  return Array.isArray(rep) ? (rep[0] ?? null) : rep;
}

function resolveDeal(deals: VehicleRow["deals"]): DealRow | null {
  if (!deals) return null;
  const list = Array.isArray(deals) ? deals : [deals];
  return list[0] ?? null;
}

export async function getInventoryVehicles(): Promise<InventoryVehicle[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { dealershipId } = auth.user;
  const today = new Date().toISOString().split("T")[0];

  const { data: rows, error } = await supabase
    .from("vehicles")
    .select(
      `
      id, vin, stock_number, make, model, trim, year, mileage, lot_location,
      acquisition_date, acquisition_cost, registration_fees, auction_fees,
      flooring_fees, flooring_start_date, asking_price, reconditioning_cost,
      total_invested, title_received, title_status, status,
      images:vehicle_images(storage_path, is_primary, sort_order),
      deals(
        sale_date, sales_tax_amount, license_fees, commission_amount,
        commission_rate, net_profit, roi_percent, sold_price_before_tax,
        sales_rep:users!deals_sales_rep_id_fkey(full_name, image_url)
      )
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getInventoryVehicles: query error", error.message);
    return [];
  }

  const vehicles: InventoryVehicle[] = [];

  for (const row of (rows ?? []) as unknown as VehicleRow[]) {
    const imageUrl = await getPrimaryImageUrl(supabase, row.images);
    const deal = resolveDeal(row.deals);
    const salesRep = resolveSalesRep(deal?.sales_rep ?? null);
    const purchasePrice = Number(row.acquisition_cost ?? 0);
    const registrationFees = Number(row.registration_fees ?? 0);
    const auctionFees = Number(row.auction_fees ?? 0);
    const repairs = Number(row.reconditioning_cost ?? 0);
    const flooringCost = Number(row.flooring_fees ?? 0);
    const flooringStart = row.flooring_start_date ?? row.acquisition_date;
    const flooringAgeDays = flooringStart
      ? daysBetween(flooringStart, today)
      : 0;

    const storedTotal = Number(row.total_invested ?? 0);
    const computedTotal =
      purchasePrice + registrationFees + auctionFees + repairs + flooringCost;
    const totalInvestment = storedTotal > 0 ? storedTotal : computedTotal;
    const totalVehicleCost = totalInvestment;

    const soldDate = deal?.sale_date ? formatISO(deal.sale_date) : undefined;
    const soldThisMonth =
      (row.status === "sold" || row.status === "loss") && isInCurrentMonth(soldDate);

    const commissionAmount = Number(deal?.commission_amount ?? 0);
    const commissionRate = Number(deal?.commission_rate ?? 0);
    const netProfit = Number(deal?.net_profit ?? 0);
    const roiPercent = Number(deal?.roi_percent ?? 0);
    const salesTax = Number(deal?.sales_tax_amount ?? 0);

    vehicles.push({
      id: row.id,
      image: imageUrl,
      make: row.make,
      model: row.model,
      trim: row.trim ?? "",
      year: row.year,
      addOnRevenue: 0,
      addOnItems: [],
      stockNumber: row.stock_number ?? "",
      vin: row.vin,
      mileage: row.mileage ?? 0,
      price: Number(row.asking_price ?? 0),
      cost: purchasePrice,
      purchasePrice,
      registrationFees,
      auctionFees,
      totalInvested: totalInvestment,
      daysInInventory: daysSince(row.acquisition_date),
      status: mapDbVehicleStatus(row.status),
      location: row.lot_location ?? "",
      arrivalDate: formatISO(row.acquisition_date),
      titleReceived: mapDbTitleReceived(row.title_received, row.title_status),
      dbStatus: row.status,
      repairs,
      flooringCost,
      flooringAgeDays,
      salesTax,
      totalInvestment,
      totalVehicleCost,
      commissionAmount,
      commissionRate,
      netProfit,
      roiPercent,
      salesRepName: salesRep?.full_name ?? "",
      salesRepImage: salesRep?.image_url ?? "",
      soldDate,
      soldThisMonth,
    });
  }

  return vehicles;
}
