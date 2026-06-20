import { createClient } from "@/lib/supabase/server";
import {
  fetchCommissionsByJacketIds,
} from "@/lib/sales-rep/commissions/server/fetch-commissions-by-jacket-ids";
import { isCommissionPaid } from "@/lib/sales-rep/commissions/normalize-status";
import {
  aggregatePeriodTotals,
  type RawDealJacket,
  type RawDealershipExpense,
  type RawVehicleExpense,
} from "@/lib/profit-loss/server/aggregate-pl-data";
import { finalizePeriodTotals, type PeriodTotals } from "@/lib/profit-loss/build-report";

export type JacketRow = {
  id: string;
  sold_price: number;
  total_invested: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  commission_status: string;
  total_tax: number;
  date_sold: string;
  vehicle_id: string;
  amount_financed: number;
  balance_due: number;
  sales_rep_id: string | null;
  vehicle: {
    acquisition_cost: number | null;
    year: number;
    make: string;
    model: string;
    stock_number: string | null;
    vin: string;
    purchase_type: string | null;
    body_style: string | null;
    acquisition_date: string | null;
    trim: string | null;
  } | null;
};

export type CpaVehicleSoldRow = {
  id: string;
  dateSold: string;
  stockNumber: string;
  vehicle: string;
  vin: string;
  salePrice: number;
  grossProfit: number;
};

export type DealJacketStatusRow = {
  id: string;
  balance_due: number;
  amount_financed: number;
  document_count: number;
};

export type RawDealershipExpenseWithMeta = RawDealershipExpense & {
  description: string;
  vendor: string;
};

async function fetchJacketsInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<JacketRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      id,
      sold_price,
      total_invested,
      profit_gross,
      profit_net,
      commission_amount,
      total_tax,
      date_sold,
      vehicle_id,
      amount_financed,
      balance_due,
      sales_rep_id,
      vehicle:vehicles(acquisition_cost, year, make, model, stock_number, vin, purchase_type, body_style, acquisition_date, trim)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`)
    .order("date_sold", { ascending: false });

  if (error) {
    console.warn("cpa fetchJacketsInRange:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as JacketRow[];
  const commissionMap = await fetchCommissionsByJacketIds(rows.map((r) => r.id));
  return rows.map((row) => ({
    ...row,
    commission_status: commissionMap.get(row.id)?.status ?? "pending_review",
  }));
}

async function fetchDealershipExpensesInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<RawDealershipExpenseWithMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dealership_expenses")
    .select("category, amount, expense_date, description, vendor")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("expense_date", from)
    .lte("expense_date", to);

  if (error) {
    console.warn("cpa fetchDealershipExpensesInRange:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    category: row.category as string,
    amount: Number(row.amount),
    expense_date: row.expense_date as string,
    description: (row.description as string) ?? "",
    vendor: (row.vendor as string) ?? "",
  })) as RawDealershipExpenseWithMeta[];
}

async function fetchVehicleExpensesForVehicles(
  dealershipId: string,
  vehicleIds: string[],
  from: string,
  to: string,
): Promise<RawVehicleExpense[]> {
  if (vehicleIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_expenses")
    .select("vehicle_id, total_cost, category, repair_type, repair_date")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .in("vehicle_id", vehicleIds)
    .gte("repair_date", from)
    .lte("repair_date", to);

  if (error) {
    console.warn("cpa fetchVehicleExpensesForVehicles:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    vehicle_id: row.vehicle_id as string,
    total_cost: Number(row.total_cost),
    category: (row.category as string) ?? "",
    repair_type: (row.repair_type as string) ?? "",
    repair_date: row.repair_date as string,
  }));
}

function toRawDealJacket(row: JacketRow): RawDealJacket {
  const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
  return {
    sold_price: Number(row.sold_price),
    total_invested: Number(row.total_invested),
    profit_gross: Number(row.profit_gross),
    profit_net: Number(row.profit_net),
    commission_amount: Number(row.commission_amount),
    total_tax: Number(row.total_tax),
    date_sold: row.date_sold,
    vehicle_id: row.vehicle_id,
    amount_financed: Number(row.amount_financed),
    acquisition_cost: vehicle?.acquisition_cost
      ? Number(vehicle.acquisition_cost)
      : null,
  };
}

export async function aggregateCpaPeriod(
  dealershipId: string,
  from: string,
  to: string,
): Promise<{
  totals: PeriodTotals;
  jackets: JacketRow[];
  dealershipExpenses: RawDealershipExpenseWithMeta[];
}> {
  const jacketRows = await fetchJacketsInRange(dealershipId, from, to);
  const jackets = jacketRows.map(toRawDealJacket);
  const vehicleIds = [...new Set(jackets.map((j) => j.vehicle_id))];

  const [vehicleExpenses, dealershipExpenses] = await Promise.all([
    fetchVehicleExpensesForVehicles(dealershipId, vehicleIds, from, to),
    fetchDealershipExpensesInRange(dealershipId, from, to),
  ]);

  const expensesForAggregate: RawDealershipExpense[] = dealershipExpenses.map(
    ({ category, amount, expense_date }) => ({
      category,
      amount,
      expense_date,
    }),
  );

  const totals = finalizePeriodTotals(
    aggregatePeriodTotals(jackets, vehicleExpenses, expensesForAggregate),
  );

  return { totals, jackets: jacketRows, dealershipExpenses };
}

export function mapVehiclesSold(jacketRows: JacketRow[]): CpaVehicleSoldRow[] {
  return jacketRows.map((row) => {
    const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    const year = vehicle?.year ?? 0;
    const make = vehicle?.make ?? "";
    const model = vehicle?.model ?? "";
    return {
      id: row.id,
      dateSold: row.date_sold.split("T")[0],
      stockNumber: vehicle?.stock_number ?? "",
      vehicle: `${year} ${make} ${model}`.trim(),
      vin: vehicle?.vin ?? "",
      salePrice: Number(row.sold_price),
      grossProfit: Number(row.profit_gross),
    };
  });
}

export async function countVehiclesPurchased(
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("acquisition_date", from)
    .lte("acquisition_date", to);

  if (error) {
    console.warn("cpa countVehiclesPurchased:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countVehiclesAdded(
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const supabase = await createClient();
  const fromIso = `${from}T00:00:00`;
  const toIso = `${to}T23:59:59`;
  const { count, error } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("created_at", fromIso)
    .lte("created_at", toIso);

  if (error) {
    console.warn("cpa countVehiclesAdded:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countInventoryRemaining(dealershipId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .eq("status", "in_stock");

  if (error) {
    console.warn("cpa countInventoryRemaining:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchAllDealJacketsForStatus(
  dealershipId: string,
): Promise<DealJacketStatusRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select("id, balance_due, amount_financed")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (error) {
    console.warn("cpa fetchAllDealJacketsForStatus:", error.message);
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

  return (data ?? []).map((row) => ({
    id: row.id as string,
    balance_due: Number(row.balance_due ?? 0),
    amount_financed: Number(row.amount_financed ?? 0),
    document_count: docCountByJacket.get(row.id as string) ?? 0,
  }));
}

export async function fetchStorageFileCounts(
  dealershipId: string,
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("bucket, original_name, source_entity")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (error) {
    console.warn("cpa fetchStorageFileCounts:", error.message);
    return new Map();
  }

  const counts = new Map<string, number>();
  const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

  for (const file of data ?? []) {
    const name = ((file.original_name as string) ?? "").toLowerCase();
    const bucket = file.bucket as string;
    const source = (file.source_entity as string) ?? "";

    if (bucket === "deal-jacket-documents") bump("deals");
    if (bucket === "expense-receipts") bump("receipts");

    if (name.includes("bank") || name.includes("statement")) bump("bank");
    if (name.includes("payroll") || name.includes("wage") || name.includes("commission")) {
      bump("payroll");
    }
    if (
      name.includes("tax") ||
      name.includes("cdtfa") ||
      name.includes("sales tax")
    ) {
      bump("tax");
    }
    if (name.includes("audit")) bump("audit");

    if (source === "dealership_expense" && !name.includes("tax")) {
      bump("receipts");
    }
    if (bucket === "vehicle-documents") bump("bank");
  }

  return counts;
}

export async function fetchNextPayrollEventDate(
  dealershipId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("calendar_events")
    .select("event_date")
    .eq("dealership_id", dealershipId)
    .eq("event_type", "payroll")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1);

  if (error || !data?.length) return null;
  return data[0].event_date as string;
}

export function sumTaxPayments(
  expenses: RawDealershipExpenseWithMeta[],
): number {
  return expenses.reduce((sum, exp) => {
    const text = `${exp.description} ${exp.vendor} ${exp.category}`.toLowerCase();
    if (
      text.includes("tax") ||
      text.includes("cdtfa") ||
      text.includes("sales tax")
    ) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);
}

export function sumSalaryWages(
  expenses: RawDealershipExpenseWithMeta[],
): number {
  return expenses
    .filter((e) => e.category === "salary_wages")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function sumBonuses(expenses: RawDealershipExpenseWithMeta[]): number {
  return expenses.reduce((sum, exp) => {
    const text = `${exp.description} ${exp.vendor}`.toLowerCase();
    if (text.includes("bonus")) return sum + exp.amount;
    return sum;
  }, 0);
}

export function sumPayrollTaxes(
  expenses: RawDealershipExpenseWithMeta[],
): number {
  return expenses.reduce((sum, exp) => {
    const text = `${exp.description} ${exp.vendor}`.toLowerCase();
    if (
      text.includes("payroll tax") ||
      text.includes("fica") ||
      text.includes("withholding")
    ) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);
}

export function countDistinctPayrollEmployees(
  expenses: RawDealershipExpenseWithMeta[],
  jacketRows: JacketRow[],
): number {
  const vendors = new Set(
    expenses
      .filter((e) => e.category === "salary_wages")
      .map((e) => e.vendor.trim().toLowerCase())
      .filter(Boolean),
  );
  const reps = new Set(
    jacketRows
      .map((j) => j.sales_rep_id)
      .filter((id): id is string => Boolean(id)),
  );
  const total = new Set([...vendors, ...reps]).size;
  return total;
}

export function sumPaidCommissions(jacketRows: JacketRow[]): number {
  return jacketRows.reduce((sum, row) => {
    if (isCommissionPaid(row.commission_status)) {
      return sum + Number(row.commission_amount);
    }
    return sum;
  }, 0);
}

export function sumAllCommissions(jacketRows: JacketRow[]): number {
  return jacketRows.reduce(
    (sum, row) => sum + Number(row.commission_amount),
    0,
  );
}

type ExtendedJacketRow = JacketRow & {
  customer: { name: string } | { name: string }[] | null;
  sales_rep: { full_name: string } | { full_name: string }[] | null;
};

export async function fetchJacketsInRangeExtended(
  dealershipId: string,
  from: string,
  to: string,
): Promise<ExtendedJacketRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      id,
      sold_price,
      total_invested,
      profit_gross,
      profit_net,
      commission_amount,
      total_tax,
      date_sold,
      vehicle_id,
      amount_financed,
      balance_due,
      sales_rep_id,
      vehicle:vehicles(acquisition_cost, year, make, model, stock_number, vin, purchase_type, body_style, acquisition_date, trim),
      customer:customers(name),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`)
    .order("date_sold", { ascending: false });

  if (error) {
    console.warn("cpa fetchJacketsInRangeExtended:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as ExtendedJacketRow[];
  const commissionMap = await fetchCommissionsByJacketIds(rows.map((r) => r.id));
  return rows.map((row) => ({
    ...row,
    commission_status: commissionMap.get(row.id)?.status ?? "pending_review",
  }));
}

export type PurchasedVehicleRow = {
  id: string;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  total_invested: number | null;
  stock_number: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
};

export async function fetchVehiclesPurchasedInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<PurchasedVehicleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, acquisition_date, acquisition_cost, total_invested, stock_number, year, make, model",
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("acquisition_date", from)
    .lte("acquisition_date", to)
    .order("acquisition_date", { ascending: false });

  if (error) {
    console.warn("cpa fetchVehiclesPurchasedInRange:", error.message);
    return [];
  }

  return (data ?? []) as PurchasedVehicleRow[];
}

export function mapMonthlyVehiclesSold(
  rows: ExtendedJacketRow[],
): import("@/lib/cpa/types").CpaMonthlyVehicleSold[] {
  return rows.map((row) => {
    const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
    const salesRep = Array.isArray(row.sales_rep) ? row.sales_rep[0] : row.sales_rep;
    const year = vehicle?.year ?? 0;
    const make = vehicle?.make ?? "";
    const model = vehicle?.model ?? "";
    const cogs = Number(row.total_invested);
    return {
      id: row.id,
      date: new Date(row.date_sold).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      stockId: vehicle?.stock_number ?? "...",
      vehicle: `${year} ${make} ${model}`.trim(),
      customer: customer?.name ?? "...",
      salePrice: Number(row.sold_price),
      cogs,
      grossProfit: Number(row.profit_gross),
      salesRep: salesRep?.full_name ?? "Unassigned",
    };
  });
}

export function mapMonthlyVehiclesPurchased(
  rows: PurchasedVehicleRow[],
): import("@/lib/cpa/types").CpaMonthlyVehiclePurchased[] {
  return rows.map((row) => {
    const purchasePrice = Number(row.acquisition_cost ?? 0);
    const cost = Number(row.total_invested ?? row.acquisition_cost ?? 0);
    return {
      id: row.id,
      date: row.acquisition_date
        ? new Date(`${row.acquisition_date}T12:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "...",
      stockId: row.stock_number ?? "...",
      vehicle: `${row.year ?? ""} ${row.make ?? ""} ${row.model ?? ""}`.trim(),
      purchasePrice,
      cost,
    };
  });
}

export function sumBenefits(expenses: RawDealershipExpenseWithMeta[]): number {
  return expenses.reduce((sum, exp) => {
    const text = `${exp.description} ${exp.vendor}`.toLowerCase();
    if (text.includes("benefit") || text.includes("401k") || text.includes("health")) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);
}

export function sumFinanceCommissions(
  expenses: RawDealershipExpenseWithMeta[],
): number {
  return expenses.reduce((sum, exp) => {
    const text = `${exp.description} ${exp.vendor} ${exp.category}`.toLowerCase();
    if (text.includes("finance commission") || text.includes("f&i")) {
      return sum + exp.amount;
    }
    return sum;
  }, 0);
}
