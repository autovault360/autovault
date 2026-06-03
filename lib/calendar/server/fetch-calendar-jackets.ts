import { createClient } from "@/lib/supabase/server";

export type CalendarJacketRow = {
  id: string;
  date_sold: string;
  sold_price: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  commission_status: string;
  total_tax: number;
  amount_financed: number;
  total_invested: number;
  sales_rep_id: string | null;
  vehicle_id: string;
  sales_rep_name: string | null;
  customer_name: string;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  lot_location: string | null;
  vin: string;
  document_count: number;
};

export async function fetchCalendarJackets(
  dealershipId: string,
  from: string,
  to: string,
): Promise<CalendarJacketRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      id,
      date_sold,
      sold_price,
      profit_gross,
      profit_net,
      commission_amount,
      commission_status,
      total_tax,
      amount_financed,
      total_invested,
      sales_rep_id,
      vehicle_id,
      vehicle:vehicles(year, make, model, stock_number, vin, lot_location),
      customer:customers(name),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`)
    .order("date_sold", { ascending: true });

  if (error) {
    console.warn("fetchCalendarJackets:", error.message);
    return [];
  }

  const jacketIds = (data ?? []).map((r) => r.id as string);
  const docCountByJacket = new Map<string, number>();

  if (jacketIds.length > 0) {
    const { data: docs } = await supabase
      .from("deal_jacket_documents")
      .select("deal_jacket_id")
      .in("deal_jacket_id", jacketIds);

    for (const doc of docs ?? []) {
      const jid = doc.deal_jacket_id as string;
      docCountByJacket.set(jid, (docCountByJacket.get(jid) ?? 0) + 1);
    }
  }

  return (data ?? []).map((row) => {
    const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
    const salesRep = Array.isArray(row.sales_rep) ? row.sales_rep[0] : row.sales_rep;

    return {
      id: row.id as string,
      date_sold: (row.date_sold as string).slice(0, 10),
      sold_price: Number(row.sold_price),
      profit_gross: Number(row.profit_gross),
      profit_net: Number(row.profit_net),
      commission_amount: Number(row.commission_amount),
      commission_status: row.commission_status as string,
      total_tax: Number(row.total_tax),
      amount_financed: Number(row.amount_financed),
      total_invested: Number(row.total_invested),
      sales_rep_id: row.sales_rep_id as string | null,
      vehicle_id: row.vehicle_id as string,
      sales_rep_name: (salesRep?.full_name as string) ?? null,
      customer_name: (customer?.name as string) ?? "Unknown",
      stock_number: (vehicle?.stock_number as string) ?? "",
      make: (vehicle?.make as string) ?? "",
      model: (vehicle?.model as string) ?? "",
      year: Number(vehicle?.year ?? 0),
      lot_location: (vehicle?.lot_location as string) ?? null,
      vin: (vehicle?.vin as string) ?? "",
      document_count: docCountByJacket.get(row.id as string) ?? 0,
    };
  });
}

export type CalendarVehicleRow = {
  id: string;
  acquisition_date: string;
  acquisition_cost: number;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  status: string;
  lot_location: string | null;
};

export async function fetchCalendarVehiclesAcquired(
  dealershipId: string,
  from: string,
  to: string,
): Promise<CalendarVehicleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, acquisition_date, acquisition_cost, stock_number, make, model, year, status, lot_location")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("acquisition_date", from)
    .lte("acquisition_date", to)
    .order("acquisition_date", { ascending: false });

  if (error) {
    console.warn("fetchCalendarVehiclesAcquired:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    acquisition_date: (row.acquisition_date as string).slice(0, 10),
    acquisition_cost: Number(row.acquisition_cost ?? 0),
    stock_number: (row.stock_number as string) ?? "",
    make: (row.make as string) ?? "",
    model: (row.model as string) ?? "",
    year: Number(row.year ?? 0),
    status: (row.status as string) ?? "in_stock",
    lot_location: (row.lot_location as string) ?? null,
  }));
}

export async function fetchInventoryCounts(dealershipId: string): Promise<{
  inStock: number;
  inRecon: number;
  totalInvested: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("status, total_invested")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("status", ["in_stock", "in_recon"]);

  if (error) {
    return { inStock: 0, inRecon: 0, totalInvested: 0 };
  }

  let inStock = 0;
  let inRecon = 0;
  let totalInvested = 0;
  for (const row of data ?? []) {
    if (row.status === "in_stock") inStock++;
    if (row.status === "in_recon") inRecon++;
    totalInvested += Number(row.total_invested ?? 0);
  }
  return { inStock, inRecon, totalInvested };
}
