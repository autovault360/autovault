"use server";

import { createClient } from "@/lib/supabase/server";
import { formatField } from "../types";
import { authenticateUser, getSignedUrl } from "./utils";

export type VehicleFilters = {
  status?: string;
  make?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export async function getVehicles(filters: VehicleFilters = {}) {
  const auth = await authenticateUser();
  if (!auth.ok) throw new Error(auth.error);
  const { dealershipId } = auth.user;
  const supabase = await createClient();

  let query = supabase
    .from("vehicles")
    .select("*", { count: "exact" })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.make) {
    query = query.eq("make", filters.make);
  }
  if (filters.search) {
    query = query.or(
      `vin.ilike.%${filters.search}%,make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,stock_number.ilike.%${filters.search}%`,
    );
  }

  const sortField = filters.sort || "created_at";
  query = query.order(sortField, { ascending: false });

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const vehicles = (data ?? []).map((v) => ({
    ...v,
    purchasePrice: Number(v.acquisition_cost ?? 0),
    registrationFees: Number(v.registration_fees ?? 0),
    auctionFees: Number(v.auction_fees ?? 0),
    totalInvested: Number(v.total_invested ?? 0),
    cost: Number(v.acquisition_cost ?? 0),
  }));

  return { vehicles, total: count ?? 0, page, limit };
}

type ImageRow = {
  storage_path: string;
  [key: string]: unknown;
};

type ExpenseRow = {
  total_cost: number;
  [key: string]: unknown;
};

type DealRow = {
  buyer_id_front_path: string | null;
  buyer_id_back_path: string | null;
  drivers_license_path: string | null;
  other_doc_path: string | null;
  [key: string]: unknown;
};

type VehicleRow = {
  acquisition_date: string | null;
  total_invested: number | null;
  asking_price: number | null;
  acquisition_cost: number | null;
  registration_fees: number | null;
  auction_fees: number | null;
  year: number;
  make: string;
  model: string;
  images: ImageRow[];
  expenses: ExpenseRow[];
  deals: DealRow[];
  [key: string]: unknown;
};

export async function getVehicleById(id: string) {
  const auth = await authenticateUser();
  if (!auth.ok) return null;
  const { dealershipId } = auth.user;
  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      images:vehicle_images(*),
      expenses:vehicle_expenses(*),
      pricing_history(*),
      status_history(*),
      deals(*),
      vehicle_losses(*)
    `)
    .eq("id", id)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (error || !vehicle) return null;

  const vehicleRow = vehicle as unknown as VehicleRow;

  const daysInInventory = vehicleRow.acquisition_date
    ? Math.floor(
        (Date.now() - new Date(vehicleRow.acquisition_date).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const totalReconditioning = Math.max(
    Number((vehicleRow as Record<string, unknown>).reconditioning_cost as number | null ?? 0),
    (vehicleRow.expenses ?? []).reduce(
      (sum: number, e: ExpenseRow) => sum + Number(e.total_cost),
      0,
    ),
  );

  const totalInvested = Number(vehicleRow.total_invested ?? 0);
  const askingPrice = Number(vehicleRow.asking_price ?? 0);
  const acquisitionCost = Number(vehicleRow.acquisition_cost ?? 0);
  const registrationFees = Number(vehicleRow.registration_fees ?? 0);
  const auctionFees = Number(vehicleRow.auction_fees ?? 0);
  const grossProfit = askingPrice - totalInvested;
  const grossProfitPct = totalInvested > 0
    ? (grossProfit / totalInvested) * 100
    : 0;

  const imagesWithUrls = await Promise.all(
    (vehicleRow.images ?? []).map(async (img: ImageRow) => ({
      ...img,
      url: await getSignedUrl("vehicle-images", img.storage_path),
    })),
  );

  const deal = vehicleRow.deals?.[0] ?? null;
  let buyerIdFrontUrl: string | null = null;
  if (deal?.buyer_id_front_path) {
    buyerIdFrontUrl = await getSignedUrl(
      "vehicle-documents",
      deal.buyer_id_front_path,
    );
  }

  return {
    ...vehicle,
    images: imagesWithUrls,
    daysInInventory,
    totalReconditioning,
    totalInvested,
    grossProfit,
    grossProfitPct,
    purchasePrice: acquisitionCost,
    registrationFees,
    auctionFees,
    displayTitle: `${vehicleRow.year} ${formatField("make", vehicleRow.make)} ${formatField("model", vehicleRow.model, vehicleRow.make)}`,
    _docUrls: { buyerIdFrontUrl },
  };
}
