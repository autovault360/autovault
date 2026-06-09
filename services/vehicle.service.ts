import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";

export type VehicleRow = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  stock_number: string | null;
  vin: string;
  mileage: number | null;
  status: string;
  asking_price: number | null;
  acquisition_cost: number | null;
  total_invested: number | null;
  lot_location: string | null;
  exterior_color: string | null;
  images?: { storage_path: string; is_primary: boolean; sort_order: number | null }[];
};

export type TopVehicle = {
  title: string;
  vin: string;
  profit: number;
  img: string;
};

export type InventoryAgingBracket = {
  id: string;
  label: string;
  color: string;
  count: number;
  percent: number;
};

type JacketJoin = {
  profit_gross: number;
  vehicle_id: string;
  vehicle: { year: number; make: string; model: string } | null;
};

async function resolveVehicleImage(vehicleId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_images")
    .select("storage_path")
    .eq("vehicle_id", vehicleId)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (data?.storage_path) {
    try {
      return await getSignedUrl("vehicle-images", data.storage_path, 3600);
    } catch {
      return null;
    }
  }
  return null;
}

export async function getVehicleCount(dealershipId: string, to?: string): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (to) {
    query = query.lte("created_at", `${to}T23:59:59`);
  }

  const { count, error } = await query;

  if (error) {
    console.warn("getVehicleCount:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getSoldThisMonth(
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("deal_jackets")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`);

  if (error) {
    console.warn("getSoldThisMonth:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getInventoryVsSoldTrend(
  dealershipId: string,
  monthsBack: number = 6,
): Promise<{ name: string; inventory: number; sold: number }[]> {
  const result: { name: string; inventory: number; sold: number }[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    const from = d.toISOString().slice(0, 7) + "-01";
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [inv, sold] = await Promise.all([
      getVehicleCount(dealershipId),
      getSoldThisMonth(dealershipId, from, to),
    ]);

    result.push({ name: monthStr, inventory: inv, sold });
  }

  return result;
}

export async function getTopVehiclesByProfit(
  dealershipId: string,
  limit: number = 5,
): Promise<TopVehicle[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select("profit_gross, vehicle_id, vehicle:vehicles(year, make, model)")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .not("profit_gross", "is", null)
    .order("profit_gross", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("getTopVehiclesByProfit:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as JacketJoin[];
  const results: TopVehicle[] = [];

  for (const row of rows) {
    const v = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    if (!v) continue;
    const img = await resolveVehicleImage(row.vehicle_id);
    results.push({
      title: `${v.year} ${v.make} ${v.model}`,
      vin: "",
      profit: row.profit_gross ?? 0,
      img: img ?? "",
    });
  }

  return results;
}

export async function getInventoryAging(
  dealershipId: string,
): Promise<InventoryAgingBracket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, status, created_at")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("status", ["in_stock", "needs_attention"]);

  if (error) {
    console.warn("getInventoryAging:", error.message);
    return [];
  }

  const now = Date.now();
  const brackets: Record<string, { label: string; color: string; count: number }> = {
    "under-30": { label: "Under 30 Days", color: "#22c55e", count: 0 },
    "30-60": { label: "30 - 60 Days", color: "#3b82f6", count: 0 },
    "60-90": { label: "60 - 90 Days", color: "#f59e0b", count: 0 },
    "90-plus": { label: "90+ Days", color: "#ef4444", count: 0 },
  };

  for (const v of data ?? []) {
    const days = (now - new Date(v.created_at).getTime()) / 86400000;
    if (days < 30) brackets["under-30"].count++;
    else if (days < 60) brackets["30-60"].count++;
    else if (days < 90) brackets["60-90"].count++;
    else brackets["90-plus"].count++;
  }

  const total = Object.values(brackets).reduce((s, b) => s + b.count, 0);
  return Object.entries(brackets).map(([id, b]) => ({
    id,
    label: b.label,
    color: b.color,
    count: b.count,
    percent: total > 0 ? Math.round((b.count / total) * 1000) / 10 : 0,
  }));
}

export async function getInventoryValue(dealershipId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("total_invested")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("status", ["in_stock", "needs_attention"]);

  if (error) {
    console.warn("getInventoryValue:", error.message);
    return 0;
  }

  return (data ?? []).reduce((sum, v) => sum + Number(v.total_invested ?? 0), 0);
}

export async function getVehiclesByStatus(
  dealershipId: string,
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("status")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (error) {
    console.warn("getVehiclesByStatus:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const v of data ?? []) {
    counts[v.status] = (counts[v.status] ?? 0) + 1;
  }
  return counts;
}

export async function getDashboardInventoryPreview(
  dealershipId: string,
  limit: number = 5,
): Promise<
  Array<{
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    stockNumber: string;
    totalInvested: number;
    status: string;
    daysInLot: number;
    purchaseDate: string;
    imageUrl?: string;
  }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, vin, year, make, model, stock_number, status, total_invested, acquisition_cost, created_at",
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("getDashboardInventoryPreview:", error.message);
    return [];
  }

  const now = Date.now();
  const results = [];

  for (const row of data ?? []) {
    const imageUrl = await resolveVehicleImage(row.id);
    const daysInLot = Math.max(
      0,
      Math.floor((now - new Date(row.created_at).getTime()) / 86400000),
    );
    results.push({
      id: row.id,
      vin: row.vin,
      year: row.year,
      make: row.make,
      model: row.model,
      stockNumber: row.stock_number ?? "N/A",
      totalInvested: Number(row.total_invested ?? row.acquisition_cost ?? 0),
      status: row.status,
      daysInLot,
      purchaseDate: row.created_at?.slice(0, 10) ?? "",
      imageUrl: imageUrl ?? undefined,
    });
  }

  return results;
}

export async function getLotLocations(dealershipId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("lot_location")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .not("lot_location", "is", null);

  if (error) {
    console.warn("getLotLocations:", error.message);
    return [];
  }

  return [...new Set((data ?? []).map((v) => v.lot_location as string))].sort();
}
