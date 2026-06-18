import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getRemindersReport } from "@/lib/reminders/server/get-reminders-report";
import {
  REPORTS_REMINDERS_MOCK,
} from "@/lib/reports-reminders/mock-data";
import type {
  ReportsAiAnswer,
  ReportsDrilldownColumn,
  ReportsDrilldownPayload,
  ReportsDrilldownRow,
  ReportsDrilldownType,
  ReportsFilters,
  ReportsFilterOptions,
  ReportsRemindersMock,
} from "@/lib/reports-reminders/types";
import type { RemindersReport } from "@/lib/reminders/types";

type Period = { from: string; to: string; label: string };
type SortDirection = "asc" | "desc";

type DealRow = {
  id: string;
  jacket_number: string | null;
  sold_price: number | null;
  total_tax: number | null;
  total_invested: number | null;
  additional_expenses: number | null;
  commission_amount: number | null;
  profit_gross: number | null;
  profit_net: number | null;
  date_sold: string;
  workflow_status: string | null;
  vehicle_id: string;
  customer_id: string;
  sales_rep_id: string | null;
  vehicle: {
    year: number | null;
    make: string | null;
    model: string | null;
    stock_number: string | null;
    vin: string | null;
    acquisition_cost: number | null;
    total_invested: number | null;
    asking_price: number | null;
    status: string | null;
  } | null;
  customer: { name: string | null } | null;
  sales_rep: { full_name: string | null } | null;
};

type VehicleRow = {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  stock_number: string | null;
  vin: string | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  total_invested: number | null;
  asking_price: number | null;
  seller_auction: string | null;
  purchase_type: string | null;
  status: string | null;
  state: string | null;
  created_at: string;
};

type DealershipExpenseRow = {
  id: string;
  expense_date: string;
  category: string;
  vendor: string | null;
  description: string | null;
  amount: number | null;
  receipt_storage_path: string | null;
};

type VehicleExpenseRow = {
  id: string;
  vehicle_id: string;
  repair_date: string;
  category: string;
  repair_type: string | null;
  description: string | null;
  shop_vendor: string | null;
  total_cost: number | null;
  receipt_storage_path: string | null;
  vehicle: {
    year: number | null;
    make: string | null;
    model: string | null;
    stock_number: string | null;
  } | null;
};

type CommissionRow = {
  id: string;
  commission_amount: number | null;
  gross_profit: number | null;
  sold_price: number | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  sales_rep: { full_name: string | null } | null;
  deal_jacket: { id: string; jacket_number: string | null; date_sold: string | null } | null;
};

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CATEGORY_COLORS: Record<string, string> = {
  vehicle: "#3b82f6",
  reconditioning: "#3b82f6",
  repairs: "#ef4444",
  tires: "#f59e0b",
  payroll: "#22c55e",
  salary_wages: "#22c55e",
  rent: "#a855f7",
  utilities: "#06b6d4",
  advertising: "#f59e0b",
  accounting: "#6b7280",
  office: "#06b6d4",
  misc: "#6b7280",
  other: "#6b7280",
};

const defaultOptions: ReportsFilterOptions = {
  salesReps: [{ value: "all", label: "All Sales Reps" }],
  vehicles: [{ value: "all", label: "All Vehicles" }],
  customers: [{ value: "all", label: "All Customers" }],
  categories: [{ value: "all", label: "All Categories" }],
  dealJackets: [{ value: "all", label: "All Deal Jackets" }],
  states: [{ value: "all", label: "All States" }],
};

export async function getReportsCommandCenterData(
  filters: ReportsFilters = REPORTS_REMINDERS_MOCK_FILTERS,
): Promise<{ report: ReportsRemindersMock; reminders: RemindersReport }> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return {
      report: { ...REPORTS_REMINDERS_MOCK, filterOptions: defaultOptions },
      reminders: await getRemindersReport(),
    };
  }

  const period = resolvePeriod(filters);
  const previous = previousPeriod(period);
  const { dealershipId } = auth.user;

  const [deals, previousDeals, dealershipExpenses, vehicleExpenses, vehicles, commissions, reminders, filterOptions] =
    await Promise.all([
      fetchDeals(dealershipId, period, filters),
      fetchDeals(dealershipId, previous, filters),
      fetchDealershipExpenses(dealershipId, period, filters),
      fetchVehicleExpenses(dealershipId, period, filters),
      fetchVehicles(dealershipId, filters),
      fetchCommissions(dealershipId, period, filters),
      getRemindersReport(),
      getReportsFilterOptions(dealershipId),
    ]);

  return {
    report: buildReport(deals, previousDeals, dealershipExpenses, vehicleExpenses, vehicles, commissions, reminders, filterOptions),
    reminders,
  };
}

export async function getReportsDrilldown(
  type: ReportsDrilldownType,
  filters: ReportsFilters,
  options: { page?: number; pageSize?: number; sortBy?: string; sortDirection?: SortDirection } = {},
): Promise<ReportsDrilldownPayload> {
  const auth = await authenticateUser();
  if (!auth.ok) return emptyDrilldown(type, "Authentication required");

  const period = resolvePeriod(filters);
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, options.pageSize ?? 25));
  const { dealershipId } = auth.user;

  const [deals, dealershipExpenses, vehicleExpenses, vehicles, commissions, reminders] = await Promise.all([
    fetchDeals(dealershipId, period, filters),
    fetchDealershipExpenses(dealershipId, period, filters),
    fetchVehicleExpenses(dealershipId, period, filters),
    fetchVehicles(dealershipId, filters),
    fetchCommissions(dealershipId, period, filters),
    getRemindersReport(),
  ]);

  const payload = buildDrilldown(type, period, deals, dealershipExpenses, vehicleExpenses, vehicles, commissions, reminders);
  const sortedRows = sortRows(payload.rows, options.sortBy, options.sortDirection ?? "desc");
  const start = (page - 1) * pageSize;

  return {
    ...payload,
    rows: sortedRows.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total: sortedRows.length,
      hasMore: start + pageSize < sortedRows.length,
    },
  };
}

export async function getReportsAiAnswer(
  question: string,
  filters: ReportsFilters,
): Promise<ReportsAiAnswer> {
  const normalized = question.toLowerCase();
  const type: ReportsDrilldownType =
    normalized.includes("expense") ? "expense-report" :
    normalized.includes("last month") || normalized.includes("gross profit") ? "gross-profit" :
    normalized.includes("attention") || normalized.includes("reminder") || normalized.includes("overdue") ? "reminders-overview" :
    normalized.includes("sales rep") || normalized.includes("rep") ? "sales-performance" :
    normalized.includes("60") || normalized.includes("aging") || normalized.includes("stock") ? "inventory-overview" :
    "gross-profit";

  const drilldown = await getReportsDrilldown(type, filters, { pageSize: 8 });
  const totalRows = drilldown.pagination.total;
  const leading = drilldown.rows[0]?.title ?? drilldown.rows[0]?.values[drilldown.columns[0]?.key ?? ""] ?? "No matching records";

  return {
    question,
    answer:
      totalRows > 0
        ? `I found ${totalRows} matching records for ${drilldown.title.toLowerCase()}. The top item is ${leading}.`
        : `I could not find matching records for ${drilldown.title.toLowerCase()} in the selected period.`,
    highlights: drilldown.metrics.slice(0, 4),
    rows: drilldown.rows,
    actions: drilldown.actions,
  };
}

export async function exportReportsData(
  type: ReportsDrilldownType,
  format: "csv" | "json",
  filters: ReportsFilters,
): Promise<{ filename: string; contentType: string; body: string }> {
  const payload = await getReportsDrilldown(type, filters, { pageSize: 100 });
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") {
    return {
      filename: `${type}-${stamp}.json`,
      contentType: "application/json",
      body: JSON.stringify(payload, null, 2),
    };
  }

  const headers = payload.columns.map((c) => c.label);
  const lines = [
    headers.join(","),
    ...payload.rows.map((row) =>
      payload.columns.map((c) => csvCell(row.values[c.key] ?? "")).join(","),
    ),
  ];
  return {
    filename: `${type}-${stamp}.csv`,
    contentType: "text/csv",
    body: lines.join("\n"),
  };
}

export const REPORTS_REMINDERS_MOCK_FILTERS: ReportsFilters = {
  dateRange: "this_month",
  salesRep: "all",
  vehicle: "all",
  customer: "all",
  category: "all",
  dealJacket: "all",
  state: "all",
};

async function getReportsFilterOptions(dealershipId: string): Promise<ReportsFilterOptions> {
  const supabase = await createClient();
  const [users, vehicles, customers, jackets, dealershipCategories, vehicleCategories] = await Promise.all([
    supabase.from("users").select("id, full_name").eq("dealership_id", dealershipId).eq("is_active", true).order("full_name"),
    supabase.from("vehicles").select("id, year, make, model, stock_number, state").eq("dealership_id", dealershipId).is("deleted_at", null).order("created_at", { ascending: false }).limit(250),
    supabase.from("customers").select("id, name").eq("dealership_id", dealershipId).is("deleted_at", null).order("name").limit(250),
    supabase.from("deal_jackets").select("id, jacket_number").eq("dealership_id", dealershipId).is("deleted_at", null).order("date_sold", { ascending: false }).limit(250),
    supabase.from("dealership_expenses").select("category").eq("dealership_id", dealershipId).is("deleted_at", null),
    supabase.from("vehicle_expenses").select("category").eq("dealership_id", dealershipId).is("deleted_at", null),
  ]);

  const categories = new Set<string>(["vehicle", "reconditioning", "payroll", "rent", "utilities", "misc"]);
  for (const row of dealershipCategories.data ?? []) categories.add(String(row.category));
  for (const row of vehicleCategories.data ?? []) categories.add(String(row.category));

  const states = new Set<string>();
  for (const row of vehicles.data ?? []) {
    if (row.state) states.add(String(row.state));
  }

  return {
    salesReps: [
      defaultOptions.salesReps[0],
      ...(users.data ?? []).map((u) => ({ value: String(u.id), label: String(u.full_name ?? "Unknown") })),
    ],
    vehicles: [
      defaultOptions.vehicles[0],
      ...(vehicles.data ?? []).map((v) => ({
        value: String(v.id),
        label: `${v.year ?? ""} ${v.make ?? ""} ${v.model ?? ""}${v.stock_number ? ` (${v.stock_number})` : ""}`.trim(),
      })),
    ],
    customers: [
      defaultOptions.customers[0],
      ...(customers.data ?? []).map((c) => ({ value: String(c.id), label: String(c.name ?? "Unknown") })),
    ],
    categories: [
      defaultOptions.categories[0],
      ...[...categories].sort().map((category) => ({ value: category, label: titleize(category) })),
    ],
    dealJackets: [
      defaultOptions.dealJackets[0],
      ...(jackets.data ?? []).map((j) => ({ value: String(j.id), label: String(j.jacket_number ?? "Deal Jacket") })),
    ],
    states: [
      defaultOptions.states[0],
      ...[...states].sort().map((state) => ({ value: state, label: state })),
    ],
  };
}

async function fetchDeals(dealershipId: string, period: Period, filters: ReportsFilters): Promise<DealRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("deal_jackets")
    .select(`
      id, jacket_number, sold_price, total_tax, total_invested, additional_expenses,
      commission_amount, profit_gross, profit_net, date_sold, workflow_status,
      vehicle_id, customer_id, sales_rep_id,
      vehicle:vehicles(year, make, model, stock_number, vin, acquisition_cost, total_invested, asking_price, status),
      customer:customers(name),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name)
    `)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${period.from}T00:00:00`)
    .lte("date_sold", `${period.to}T23:59:59`)
    .order("date_sold", { ascending: false });

  if (filters.salesRep !== "all") query = query.eq("sales_rep_id", filters.salesRep);
  if (filters.vehicle !== "all") query = query.eq("vehicle_id", filters.vehicle);
  if (filters.customer !== "all") query = query.eq("customer_id", filters.customer);
  if (filters.dealJacket !== "all") query = query.eq("id", filters.dealJacket);

  const { data, error } = await query;
  if (error) {
    console.warn("fetchReportsDeals:", error.message);
    return [];
  }

  return applySearch((data ?? []) as unknown as DealRow[], filters.search, (row) => [
    row.jacket_number,
    row.customer?.name,
    row.sales_rep?.full_name,
    vehicleTitle(row.vehicle),
    row.vehicle?.vin,
  ]);
}

async function fetchVehicles(dealershipId: string, filters: ReportsFilters): Promise<VehicleRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("id, year, make, model, stock_number, vin, acquisition_date, acquisition_cost, total_invested, asking_price, seller_auction, purchase_type, status, state, created_at")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.vehicle !== "all") query = query.eq("id", filters.vehicle);
  if (filters.state !== "all") query = query.eq("state", filters.state);

  const { data, error } = await query;
  if (error) {
    console.warn("fetchReportsVehicles:", error.message);
    return [];
  }

  return applySearch((data ?? []) as VehicleRow[], filters.search, (row) => [
    vehicleTitle(row),
    row.vin,
    row.stock_number,
    row.seller_auction,
  ]);
}

async function fetchDealershipExpenses(dealershipId: string, period: Period, filters: ReportsFilters): Promise<DealershipExpenseRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("dealership_expenses")
    .select("id, expense_date, category, vendor, description, amount, receipt_storage_path")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("expense_date", period.from)
    .lte("expense_date", period.to)
    .order("expense_date", { ascending: false });

  if (filters.category !== "all" && filters.category !== "vehicle") query = query.eq("category", filters.category);
  const { data, error } = await query;
  if (error) {
    console.warn("fetchReportsDealershipExpenses:", error.message);
    return [];
  }
  return applySearch((data ?? []) as DealershipExpenseRow[], filters.search, (row) => [row.vendor, row.description, row.category]);
}

async function fetchVehicleExpenses(dealershipId: string, period: Period, filters: ReportsFilters): Promise<VehicleExpenseRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("vehicle_expenses")
    .select(`
      id, vehicle_id, repair_date, category, repair_type, description,
      shop_vendor, total_cost, receipt_storage_path,
      vehicle:vehicles(year, make, model, stock_number)
    `)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("repair_date", period.from)
    .lte("repair_date", period.to)
    .order("repair_date", { ascending: false });

  if (filters.vehicle !== "all") query = query.eq("vehicle_id", filters.vehicle);
  if (filters.category !== "all" && filters.category !== "vehicle") query = query.eq("category", filters.category);
  const { data, error } = await query;
  if (error) {
    console.warn("fetchReportsVehicleExpenses:", error.message);
    return [];
  }
  return applySearch((data ?? []) as unknown as VehicleExpenseRow[], filters.search, (row) => [
    row.shop_vendor,
    row.description,
    row.category,
    row.repair_type,
    vehicleTitle(row.vehicle),
  ]);
}

async function fetchCommissions(dealershipId: string, period: Period, filters: ReportsFilters): Promise<CommissionRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sales_rep_commissions")
    .select(`
      id, commission_amount, gross_profit, sold_price, status, paid_at, created_at,
      sales_rep:users!sales_rep_commissions_sales_rep_id_fkey(full_name),
      deal_jacket:deal_jackets(id, jacket_number, date_sold)
    `)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("created_at", `${period.from}T00:00:00`)
    .lte("created_at", `${period.to}T23:59:59`)
    .order("created_at", { ascending: false });

  if (filters.salesRep !== "all") query = query.eq("sales_rep_id", filters.salesRep);
  if (filters.dealJacket !== "all") query = query.eq("deal_jacket_id", filters.dealJacket);
  const { data, error } = await query;
  if (error) {
    console.warn("fetchReportsCommissions:", error.message);
    return [];
  }
  return applySearch((data ?? []) as unknown as CommissionRow[], filters.search, (row) => [
    row.sales_rep?.full_name,
    row.deal_jacket?.jacket_number,
    row.status,
  ]);
}

function buildReport(
  deals: DealRow[],
  previousDeals: DealRow[],
  dealershipExpenses: DealershipExpenseRow[],
  vehicleExpenses: VehicleExpenseRow[],
  vehicles: VehicleRow[],
  commissions: CommissionRow[],
  reminders: RemindersReport,
  filterOptions: ReportsFilterOptions,
): ReportsRemindersMock {
  const totals = getTotals(deals, dealershipExpenses, vehicleExpenses, commissions);
  const prevTotals = getTotals(previousDeals, [], [], []);
  const margin = totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0;
  const expenseBars = expenseBreakdown(dealershipExpenses, vehicleExpenses);
  const inventory = inventoryOverview(vehicles);
  const salesPerformance = salesLeaderboard(deals);
  const topReminders = reminders.reminders.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.title,
    statusLabel: reminderStatus(r.dueDate),
    statusTone: reminderTone(r.dueDate),
    iconTone: reminderIconTone(r.iconColor),
  }));

  return {
    ...REPORTS_REMINDERS_MOCK,
    filterOptions,
    kpis: [
      kpi("total-revenue", "dollar-sign", "green", "Total Revenue", money(totals.revenue), delta(totals.revenue, prevTotals.revenue), "#22c55e"),
      kpi("gross-profit", "pie-chart", "violet", "Gross Profit", money(totals.grossProfit), delta(totals.grossProfit, prevTotals.grossProfit), "#a855f7"),
      kpi("net-profit", "bar-chart-3", "blue", "Net Profit", money(totals.netProfit), delta(totals.netProfit, prevTotals.netProfit), "#3b82f6"),
      kpi("vehicles-sold", "car", "orange", "Vehicles Sold", String(deals.length), delta(deals.length, previousDeals.length), "#f97316"),
      kpi("vehicles-purchased", "users", "amber", "Vehicles Purchased", String(vehicles.filter((v) => inCurrentMonth(v.acquisition_date ?? v.created_at)).length), "filtered acquisition list", "#eab308"),
      kpi("total-expenses", "trending-down", "red", "Total Expenses", money(totals.expenses), "category drill-down", "#ef4444"),
      kpi("sales-tax-due", "percent", "green", "Sales Tax Collected", money(totals.salesTax), "dealer-entered tax values", "#14b8a6"),
      kpi("payroll-paid", "landmark", "green", "Payroll Paid", money(totals.payroll), "commission records", "#4ade80"),
    ],
    reportSummary: summaryRows(totals, margin),
    salesPerformance,
    expenseBars,
    inventory,
    profitLossSummary: summaryRows(totals, margin),
    payroll: [
      { label: "Total Payroll", value: money(totals.payroll) },
      { label: "Employees Paid", value: String(new Set(commissions.filter((c) => c.status === "paid").map((c) => c.sales_rep?.full_name)).size) },
      { label: "Pay Periods", value: String(new Set(commissions.map((c) => (c.paid_at ?? c.created_at).slice(0, 7))).size) },
    ],
    commissions: [
      { label: "Total Commissions", value: money(totals.commissions) },
      { label: "Pending Commissions", value: money(sum(commissions.filter((c) => c.status !== "paid"), "commission_amount")) },
      { label: "Paid Commissions", value: money(sum(commissions.filter((c) => c.status === "paid"), "commission_amount")) },
    ],
    dealJacketStatus: dealStatusSegments(deals),
    topReminders,
  };
}

function buildDrilldown(
  type: ReportsDrilldownType,
  period: Period,
  deals: DealRow[],
  dealershipExpenses: DealershipExpenseRow[],
  vehicleExpenses: VehicleExpenseRow[],
  vehicles: VehicleRow[],
  commissions: CommissionRow[],
  reminders: RemindersReport,
): ReportsDrilldownPayload {
  const totals = getTotals(deals, dealershipExpenses, vehicleExpenses, commissions);
  const base = {
    type,
    periodLabel: period.label,
    actions: actionsFor(type),
    pagination: { page: 1, pageSize: 25, total: 0, hasMore: false },
  };

  if (["total-revenue", "vehicles-sold"].includes(type)) {
    const columns = cols(["soldDate", "Sold Date"], ["customer", "Customer"], ["rep", "Sales Rep"], ["price", "Selling Price", "right"], ["gross", "Gross Profit", "right"], ["jacket", "Deal Jacket"]);
    return payload(base, type === "total-revenue" ? "Total Revenue" : "Vehicles Sold", "Sold vehicles with customer, rep, profit, and Deal Jacket shortcuts.", metrics([["Revenue", money(totals.revenue)], ["Units", String(deals.length)], ["Gross Profit", money(totals.grossProfit)]]), columns, deals.map(dealRow), "No sold vehicles match the selected filters.");
  }

  if (type === "gross-profit") {
    const columns = cols(["vehicle", "Vehicle"], ["acquisition", "Acquisition Cost", "right"], ["expenses", "Expenses", "right"], ["gross", "Gross Profit", "right"], ["jacket", "Deal Jacket"]);
    return payload(base, "Gross Profit", "Vehicle-by-vehicle profit breakdown using stored deal financial snapshots.", metrics([["Gross Profit", money(totals.grossProfit)], ["COGS", money(totals.cogs), "negative"], ["Units", String(deals.length)]]), columns, deals.map((d) => ({
      id: d.id,
      title: vehicleTitle(d.vehicle),
      href: `/dashboard/deal-jackets/${d.id}`,
      values: {
        vehicle: vehicleTitle(d.vehicle),
        acquisition: money(Number(d.vehicle?.acquisition_cost ?? 0)),
        expenses: money(Number(d.additional_expenses ?? 0)),
        gross: money(Number(d.profit_gross ?? 0)),
        jacket: d.jacket_number ?? "Open",
      },
    })), "No gross profit records match the selected filters.");
  }

  if (["net-profit", "report-summary", "profit-loss-breakdown"].includes(type)) {
    const columns = cols(["line", "Line Item"], ["amount", "Amount", "right"], ["formula", "Formula"]);
    const rows = [
      line("revenue", "Revenue", totals.revenue, "Dealer-entered sold prices"),
      line("cogs", "COGS", -totals.cogs, "Vehicle cost basis from Deal Jackets"),
      line("expenses", "Operating Expenses", -totals.operatingExpenses, "Dealership and vehicle expenses"),
      line("payroll", "Payroll / Commissions", -totals.payroll, "Sales rep commission records"),
      line("net", "Net Profit", totals.netProfit, "Revenue - COGS - Operating Expenses - Payroll"),
    ];
    return payload(base, type === "net-profit" ? "Net Profit" : "Profit & Loss Breakdown", "Explainable P&L formula for the selected period.", metrics([["Net Profit", money(totals.netProfit)], ["Margin", totals.revenue > 0 ? `${((totals.netProfit / totals.revenue) * 100).toFixed(1)}%` : "0%"], ["Sales Tax", money(totals.salesTax)]]), columns, rows, "No P&L data matches the selected filters.");
  }

  if (type === "vehicles-purchased") {
    const columns = cols(["date", "Date"], ["vehicle", "Vehicle"], ["source", "Source"], ["cost", "Cost", "right"], ["status", "Status"]);
    return payload(base, "Vehicles Purchased", "Acquisition list with source, cost, and current inventory status.", metrics([["Purchased", String(vehicles.length)], ["Inventory Cost", money(sum(vehicles, "acquisition_cost"))]]), columns, vehicles.map((v) => ({
      id: v.id,
      title: vehicleTitle(v),
      href: `/dashboard/vehicles/${v.id}`,
      values: {
        date: formatDate(v.acquisition_date ?? v.created_at),
        vehicle: vehicleTitle(v),
        source: v.seller_auction ?? v.purchase_type ?? "Not entered",
        cost: money(Number(v.acquisition_cost ?? 0)),
        status: titleize(v.status ?? "unknown"),
      },
    })), "No vehicle acquisitions match the selected filters.");
  }

  if (["total-expenses", "expense-report"].includes(type)) {
    const rows = expenseRows(dealershipExpenses, vehicleExpenses);
    const columns = cols(["date", "Date"], ["category", "Category"], ["vendor", "Vendor / Vehicle"], ["description", "Description"], ["amount", "Amount", "right"], ["receipt", "Receipt"]);
    return payload(base, type === "total-expenses" ? "Total Expenses" : "Expense Report", "Expense categories, receipts, and drill-down records.", metrics([["Total Expenses", money(totals.expenses), "negative"], ["Receipts Attached", String(rows.filter((r) => r.values.receipt === "Attached").length)], ["Categories", String(expenseBreakdown(dealershipExpenses, vehicleExpenses).length)]]), columns, rows, "No expenses match the selected filters.");
  }

  if (type === "sales-tax-due") {
    const columns = cols(["soldDate", "Sold Date"], ["jacket", "Deal Jacket"], ["customer", "Customer"], ["amount", "Tax Collected", "right"], ["status", "Status"]);
    return payload(base, "Sales Tax Due", "Dealer-entered Deal Jacket tax values only. No tax rates are calculated here.", metrics([["Tax Collected", money(totals.salesTax)], ["Deals", String(deals.length)], ["Filing Status", "Ready for CPA"]]), columns, deals.map((d) => ({
      id: d.id,
      title: d.jacket_number ?? "Deal Jacket",
      href: `/dashboard/deal-jackets/${d.id}`,
      values: {
        soldDate: formatDate(d.date_sold),
        jacket: d.jacket_number ?? "Open",
        customer: d.customer?.name ?? "Unknown",
        amount: money(Number(d.total_tax ?? 0)),
        status: "Unfiled",
      },
    })), "No sales tax values match the selected filters.");
  }

  if (["payroll-paid", "payroll-commission"].includes(type)) {
    const columns = cols(["date", "Date"], ["employee", "Employee"], ["type", "Type"], ["commission", "Commission", "right"], ["status", "Status"], ["jacket", "Deal Jacket"]);
    return payload(base, "Payroll Paid", "Employee commission, salary-like payroll expense records, and payout status.", metrics([["Paid Payroll", money(totals.payroll)], ["Commissions", money(totals.commissions)], ["Employees", String(new Set(commissions.map((c) => c.sales_rep?.full_name)).size)]]), columns, commissions.map((c) => ({
      id: c.id,
      title: c.sales_rep?.full_name ?? "Employee",
      href: c.deal_jacket?.id ? `/dashboard/deal-jackets/${c.deal_jacket.id}` : undefined,
      values: {
        date: formatDate(c.paid_at ?? c.created_at),
        employee: c.sales_rep?.full_name ?? "Unknown",
        type: "Commission",
        commission: money(Number(c.commission_amount ?? 0)),
        status: titleize(c.status),
        jacket: c.deal_jacket?.jacket_number ?? "N/A",
      },
    })), "No payroll records match the selected filters.");
  }

  if (type === "sales-performance") {
    const columns = cols(["rank", "Rank"], ["rep", "Sales Rep"], ["units", "Units", "right"], ["gross", "Gross", "right"], ["avg", "Avg Gross", "right"], ["commission", "Commission", "right"]);
    const rows = salesLeaderboard(deals).map((r) => ({
      id: String(r.rank),
      title: r.name,
      values: {
        rank: String(r.rank),
        rep: r.name,
        units: String(r.carsSold),
        gross: r.grossProfit,
        avg: money(parseMoney(r.grossProfit) / Math.max(1, r.carsSold)),
        commission: r.commission,
      },
    }));
    return payload(base, "Sales Performance", "Leaderboard with units sold, gross, average gross, and commission history.", metrics([["Sales Reps", String(rows.length)], ["Units Sold", String(deals.length)], ["Gross", money(totals.grossProfit)]]), columns, rows, "No sales performance data matches the selected filters.");
  }

  if (type === "inventory-overview") {
    const columns = cols(["vehicle", "Vehicle"], ["days", "Days In Stock", "right"], ["floor", "Floor Cost", "right"], ["asking", "Asking Price", "right"], ["status", "Status"]);
    const rows = vehicles.map((v) => ({
      id: v.id,
      title: vehicleTitle(v),
      href: `/dashboard/vehicles/${v.id}`,
      values: {
        vehicle: vehicleTitle(v),
        days: String(daysBetween(v.acquisition_date ?? v.created_at)),
        floor: money(Number(v.total_invested ?? v.acquisition_cost ?? 0)),
        asking: money(Number(v.asking_price ?? 0)),
        status: titleize(v.status ?? "unknown"),
      },
    }));
    return payload(base, "Inventory Overview", "Inventory aging by bracket with floor cost and asking price.", metrics([["Vehicles", String(vehicles.length)], ["Over 60 Days", String(rows.filter((r) => Number(r.values.days) > 60).length)], ["Inventory Value", money(sum(vehicles, "total_invested"))]]), columns, rows, "No inventory vehicles match the selected filters.");
  }

  if (type === "reminders-overview") {
    const columns = cols(["dueDate", "Due Date"], ["title", "Reminder"], ["category", "Category"], ["priority", "Priority"], ["status", "Status"]);
    const rows = reminders.reminders.map((r) => ({
      id: r.id,
      title: r.title,
      values: {
        dueDate: formatDate(r.dueDate),
        title: r.title,
        category: titleize(r.category),
        priority: titleize(r.priority),
        status: r.completed ? "Completed" : reminderStatus(r.dueDate),
      },
    }));
    return payload(base, "Reminders Overview", "Critical, upcoming, and informational action items.", metrics([["Total", String(rows.length)], ["Critical", String(reminders.reminders.filter((r) => r.priority === "high").length)], ["Upcoming", String(reminders.reminders.filter((r) => !r.completed).length)]]), columns, rows, "No reminders match the selected filters.");
  }

  return payload(base, "Report Details", "Report data for the selected section.", [], [], [], "No data available for this section yet.");
}

function resolvePeriod(filters: ReportsFilters): Period {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  if (filters.dateRange === "today") {
    return period(start, end, "Today");
  }
  if (filters.dateRange === "this_week") {
    start.setDate(now.getDate() - now.getDay());
    return period(start, end, "This Week");
  }
  if (filters.dateRange === "last_month") {
    return period(new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0), "Last Month");
  }
  if (filters.dateRange === "quarter") {
    start.setMonth(now.getMonth() - 2, 1);
    return period(start, end, "Quarter");
  }
  if (filters.dateRange === "year") {
    return period(new Date(now.getFullYear(), 0, 1), end, "Year");
  }
  if (filters.dateRange === "custom" && filters.customFrom && filters.customTo) {
    return { from: filters.customFrom, to: filters.customTo, label: "Custom Range" };
  }
  return period(new Date(now.getFullYear(), now.getMonth(), 1), end, "This Month");
}

function period(from: Date, to: Date, label: string): Period {
  return { from: isoDate(from), to: isoDate(to), label };
}

function previousPeriod(current: Period): Period {
  const from = new Date(`${current.from}T00:00:00`);
  const to = new Date(`${current.to}T00:00:00`);
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
  to.setDate(from.getDate() - 1);
  from.setDate(from.getDate() - days);
  return period(from, to, `Previous ${days} Days`);
}

function getTotals(deals: DealRow[], dealershipExpenses: DealershipExpenseRow[], vehicleExpenses: VehicleExpenseRow[], commissions: CommissionRow[]) {
  const revenue = sum(deals, "sold_price");
  const grossProfit = sum(deals, "profit_gross");
  const cogs = revenue - grossProfit;
  const operatingExpenses = sum(dealershipExpenses, "amount") + sum(vehicleExpenses, "total_cost");
  const payroll = sum(commissions.filter((c) => c.status === "paid"), "commission_amount");
  const commissionsTotal = sum(commissions, "commission_amount");
  return {
    revenue,
    grossProfit,
    cogs,
    operatingExpenses,
    expenses: operatingExpenses + payroll,
    payroll,
    commissions: commissionsTotal,
    salesTax: sum(deals, "total_tax"),
    netProfit: revenue - cogs - operatingExpenses - payroll,
  };
}

function salesLeaderboard(deals: DealRow[]) {
  const map = new Map<string, { name: string; carsSold: number; gross: number; commission: number }>();
  for (const deal of deals) {
    const key = deal.sales_rep_id ?? "unknown";
    const current = map.get(key) ?? { name: deal.sales_rep?.full_name ?? "Unassigned", carsSold: 0, gross: 0, commission: 0 };
    current.carsSold += 1;
    current.gross += Number(deal.profit_gross ?? 0);
    current.commission += Number(deal.commission_amount ?? 0);
    map.set(key, current);
  }
  return [...map.values()]
    .sort((a, b) => b.gross - a.gross)
    .map((row, index) => ({
      rank: index + 1,
      name: row.name,
      carsSold: row.carsSold,
      grossProfit: money(row.gross),
      commission: money(row.commission),
      closingRatio: row.carsSold > 0 ? `${Math.min(100, row.carsSold * 4).toFixed(1)}%` : "0%",
    }));
}

function inventoryOverview(vehicles: VehicleRow[]) {
  const brackets = [
    { id: "under-30", label: "Under 30 Days", color: "#22c55e", min: 0, max: 29 },
    { id: "30-60", label: "30 - 60 Days", color: "#3b82f6", min: 30, max: 59 },
    { id: "60-90", label: "60 - 90 Days", color: "#f59e0b", min: 60, max: 89 },
    { id: "90-plus", label: "90+ Days", color: "#ef4444", min: 90, max: Infinity },
  ];
  const total = vehicles.length;
  const days = vehicles.map((v) => daysBetween(v.acquisition_date ?? v.created_at));
  return {
    totalVehicles: total,
    avgDaysInStock: days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0,
    inventoryValue: money(sum(vehicles, "total_invested")),
    estProfitInInventory: money(vehicles.reduce((s, v) => s + Math.max(0, Number(v.asking_price ?? 0) - Number(v.total_invested ?? v.acquisition_cost ?? 0)), 0)),
    breakdown: brackets.map((b) => {
      const count = days.filter((d) => d >= b.min && d <= b.max).length;
      return { id: b.id, label: b.label, color: b.color, count, percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 };
    }),
  };
}

function expenseBreakdown(dealershipExpenses: DealershipExpenseRow[], vehicleExpenses: VehicleExpenseRow[]) {
  const map = new Map<string, number>();
  for (const e of dealershipExpenses) map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount ?? 0));
  for (const e of vehicleExpenses) map.set(e.category || "vehicle", (map.get(e.category || "vehicle") ?? 0) + Number(e.total_cost ?? 0));
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label, amount]) => ({
    label: titleize(label),
    amount,
    percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    color: CATEGORY_COLORS[label] ?? "#6b7280",
  }));
}

function expenseRows(dealershipExpenses: DealershipExpenseRow[], vehicleExpenses: VehicleExpenseRow[]): ReportsDrilldownRow[] {
  return [
    ...dealershipExpenses.map((e) => ({
      id: e.id,
      title: e.description ?? e.vendor ?? titleize(e.category),
      values: {
        date: formatDate(e.expense_date),
        category: titleize(e.category),
        vendor: e.vendor ?? "Dealership",
        description: e.description ?? "",
        amount: money(Number(e.amount ?? 0)),
        receipt: e.receipt_storage_path ? "Attached" : "Missing",
      },
    })),
    ...vehicleExpenses.map((e) => ({
      id: e.id,
      title: e.description ?? e.repair_type ?? titleize(e.category),
      href: `/dashboard/vehicles/${e.vehicle_id}`,
      values: {
        date: formatDate(e.repair_date),
        category: titleize(e.category || "vehicle"),
        vendor: e.shop_vendor ?? vehicleTitle(e.vehicle),
        description: e.description ?? e.repair_type ?? "",
        amount: money(Number(e.total_cost ?? 0)),
        receipt: e.receipt_storage_path ? "Attached" : "Missing",
      },
    })),
  ];
}

function dealStatusSegments(deals: DealRow[]) {
  const total = Math.max(1, deals.length);
  const completed = deals.filter((d) => d.workflow_status === "approved").length;
  const inProgress = deals.filter((d) => ["pending_review", "changes_requested", "resubmitted"].includes(d.workflow_status ?? "")).length;
  const funded = deals.filter((d) => Number(d.profit_net ?? 0) > 0).length;
  return [
    { label: "Completed", count: completed, percent: `${((completed / total) * 100).toFixed(1)}%`, tone: "green" as const },
    { label: "In Progress", count: inProgress, percent: `${((inProgress / total) * 100).toFixed(1)}%`, tone: "blue" as const },
    { label: "Funded", count: funded, percent: `${((funded / total) * 100).toFixed(1)}%`, tone: "emerald" as const },
  ];
}

function dealRow(d: DealRow): ReportsDrilldownRow {
  return {
    id: d.id,
    title: vehicleTitle(d.vehicle),
    href: `/dashboard/deal-jackets/${d.id}`,
    values: {
      soldDate: formatDate(d.date_sold),
      customer: d.customer?.name ?? "Unknown",
      rep: d.sales_rep?.full_name ?? "Unassigned",
      price: money(Number(d.sold_price ?? 0)),
      gross: money(Number(d.profit_gross ?? 0)),
      jacket: d.jacket_number ?? "Open",
    },
  };
}

function line(id: string, label: string, amount: number, formula: string): ReportsDrilldownRow {
  return { id, title: label, values: { line: label, amount: money(amount), formula } };
}

function payload(
  base: Pick<ReportsDrilldownPayload, "type" | "periodLabel" | "actions" | "pagination">,
  title: string,
  description: string,
  metrics: ReportsDrilldownPayload["metrics"],
  columns: ReportsDrilldownColumn[],
  rows: ReportsDrilldownRow[],
  emptyMessage: string,
): ReportsDrilldownPayload {
  return { ...base, title, description, metrics, columns, rows, emptyMessage };
}

function emptyDrilldown(type: ReportsDrilldownType, message: string): ReportsDrilldownPayload {
  return { type, title: "Report Details", description: message, periodLabel: "", metrics: [], columns: [], rows: [], actions: [], emptyMessage: message, pagination: { page: 1, pageSize: 25, total: 0, hasMore: false } };
}

function actionsFor(type: ReportsDrilldownType) {
  return [
    { id: "filter", label: "Filter", kind: "mutate" as const },
    { id: "print", label: "Print", kind: "print" as const },
    { id: "pdf", label: "Export PDF", kind: "export" as const, href: `/api/reports-reminders/export?type=${type}&format=json` },
    { id: "excel", label: "Export Excel", kind: "export" as const, href: `/api/reports-reminders/export?type=${type}&format=csv` },
  ];
}

function cols(...items: [key: string, label: string, align?: "left" | "right"][]): ReportsDrilldownColumn[] {
  return items.map(([key, label, align]) => ({ key, label, align }));
}

function metrics(items: [label: string, value: string, tone?: "positive" | "negative" | "neutral"][]) {
  return items.map(([label, value, tone]) => ({ label, value, tone }));
}

function kpi(id: ReportsDrilldownType, icon: ReportsRemindersMock["kpis"][number]["icon"], color: string, label: string, value: string, deltaValue: string, sparkColor: string) {
  return {
    id,
    icon,
    color,
    label,
    value,
    delta: deltaValue,
    sparkColor,
    sparkPoints: "0,38 25,32 50,28 75,26 100,22 125,20 150,16 175,14 200,12 220,8",
  };
}

function summaryRows(totals: ReturnType<typeof getTotals>, margin: number) {
  return [
    { label: "Total Revenue", value: money(totals.revenue), tone: "positive" as const },
    { label: "Cost of Goods Sold", value: money(totals.cogs), tone: "negative" as const },
    { label: "Gross Profit", value: money(totals.grossProfit), tone: "positive" as const },
    { label: "Total Expenses", value: money(totals.expenses), tone: "negative" as const },
    { label: "Net Profit", value: money(totals.netProfit), tone: totals.netProfit >= 0 ? "positive" as const : "negative" as const },
    { label: "Net Profit Margin", value: `${margin.toFixed(1)}%`, tone: margin >= 0 ? "positive" as const : "negative" as const },
  ];
}

function sortRows(rows: ReportsDrilldownRow[], sortBy?: string, direction: SortDirection = "desc") {
  if (!sortBy) return rows;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => String(a.values[sortBy] ?? "").localeCompare(String(b.values[sortBy] ?? "")) * multiplier);
}

function applySearch<T>(rows: T[], search: string | undefined, values: (row: T) => Array<string | null | undefined>): T[] {
  const needle = search?.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) => values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)));
}

function sum<T>(rows: T[], key: keyof T): number {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function money(value: number): string {
  return CURRENCY.format(Math.round(value));
}

function parseMoney(value: string): number {
  return Number(value.replace(/[$,]/g, "")) || 0;
}

function delta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0.0% vs last period" : "100.0% vs last period";
  return `${(((current - previous) / Math.abs(previous)) * 100).toFixed(1)}% vs last period`;
}

function vehicleTitle(vehicle: { year: number | null; make: string | null; model: string | null; stock_number?: string | null } | null): string {
  if (!vehicle) return "Unknown Vehicle";
  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  return vehicle.stock_number ? `${title} (${vehicle.stock_number})` : title || "Unknown Vehicle";
}

function titleize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function daysBetween(value: string): number {
  const start = new Date(value).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}

function inCurrentMonth(value: string): boolean {
  const d = new Date(value);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function reminderStatus(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date.slice(0, 10)}T00:00:00`);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due Today";
  if (days <= 7) return "Due This Week";
  return "Upcoming";
}

function reminderTone(date: string): "red" | "orange" | "blue" | "purple" | "green" {
  const label = reminderStatus(date);
  if (label === "Overdue") return "red";
  if (label === "Due Today") return "orange";
  if (label === "Due This Week") return "blue";
  return "green";
}

function reminderIconTone(iconColor: string): "amber" | "red" | "emerald" | "lime" | "blue" {
  if (iconColor === "red") return "red";
  if (iconColor === "green") return "emerald";
  if (iconColor === "orange") return "lime";
  if (iconColor === "blue") return "blue";
  return "amber";
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}
