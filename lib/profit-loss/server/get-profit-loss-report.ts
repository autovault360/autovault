"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { EMPTY_PERIOD_TOTALS } from "../build-report";
import type { PlFilters, PlFilterOptions, ProfitLossReport } from "../types";
import { DEFAULT_PL_FILTERS } from "../types";
import {
  buildDailyTrendFromEvents,
  buildProfitLossReport,
} from "../build-report";
import {
  aggregatePeriodTotals,
  buildDailyNetMap,
  matchesDealType,
  type RawDealJacket,
  type RawDealershipExpense,
  type RawVehicleExpense,
} from "./aggregate-pl-data";
import {
  buildDateRangeOptions,
  resolveComparisonPeriod,
  resolveCurrentPeriod,
} from "./pl-period-utils";

type JacketRow = {
  sold_price: number;
  total_invested: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  total_tax: number;
  date_sold: string;
  vehicle_id: string;
  amount_financed: number;
  sales_rep_id: string | null;
  vehicle: {
    acquisition_cost: number | null;
    lot_location: string | null;
  } | null;
};

function applyJacketFilters(
  rows: JacketRow[],
  filters: PlFilters,
): RawDealJacket[] {
  return rows
    .filter((row) => {
      if (filters.salesRep !== "all" && row.sales_rep_id !== filters.salesRep) {
        return false;
      }
      if (
        filters.location !== "all" &&
        (row.vehicle?.lot_location ?? "") !== filters.location
      ) {
        return false;
      }
      const mapped: RawDealJacket = {
        sold_price: Number(row.sold_price),
        total_invested: Number(row.total_invested),
        profit_gross: Number(row.profit_gross),
        profit_net: Number(row.profit_net),
        commission_amount: Number(row.commission_amount),
        total_tax: Number(row.total_tax),
        date_sold: row.date_sold,
        vehicle_id: row.vehicle_id,
        amount_financed: Number(row.amount_financed),
        acquisition_cost: row.vehicle?.acquisition_cost
          ? Number(row.vehicle.acquisition_cost)
          : null,
      };
      return matchesDealType(mapped, filters.dealType);
    })
    .map((row) => ({
      sold_price: Number(row.sold_price),
      total_invested: Number(row.total_invested),
      profit_gross: Number(row.profit_gross),
      profit_net: Number(row.profit_net),
      commission_amount: Number(row.commission_amount),
      total_tax: Number(row.total_tax),
      date_sold: row.date_sold,
      vehicle_id: row.vehicle_id,
      amount_financed: Number(row.amount_financed),
      acquisition_cost: row.vehicle?.acquisition_cost
        ? Number(row.vehicle.acquisition_cost)
        : null,
    }));
}

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
      sold_price,
      total_invested,
      profit_gross,
      profit_net,
      commission_amount,
      total_tax,
      date_sold,
      vehicle_id,
      amount_financed,
      sales_rep_id,
      vehicle:vehicles(acquisition_cost, lot_location)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("date_sold", `${from}T00:00:00`)
    .lte("date_sold", `${to}T23:59:59`);

  if (error) {
    console.warn("fetchJacketsInRange:", error.message);
    return [];
  }

  return (data ?? []) as unknown as JacketRow[];
}

async function fetchDealershipExpensesInRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<RawDealershipExpense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dealership_expenses")
    .select("category, amount, expense_date")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("expense_date", from)
    .lte("expense_date", to);

  if (error) {
    console.warn("fetchDealershipExpensesInRange:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    category: row.category as string,
    amount: Number(row.amount),
    expense_date: row.expense_date as string,
  }));
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
    console.warn("fetchVehicleExpensesForVehicles:", error.message);
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

async function aggregateForPeriod(
  dealershipId: string,
  from: string,
  to: string,
  filters: PlFilters,
) {
  const jacketRows = await fetchJacketsInRange(dealershipId, from, to);
  const jackets = applyJacketFilters(jacketRows, filters);
  const vehicleIds = [...new Set(jackets.map((j) => j.vehicle_id))];

  const [vehicleExpenses, dealershipExpenses] = await Promise.all([
    fetchVehicleExpensesForVehicles(dealershipId, vehicleIds, from, to),
    fetchDealershipExpensesInRange(dealershipId, from, to),
  ]);

  const totals = aggregatePeriodTotals(jackets, vehicleExpenses, dealershipExpenses);
  const dailyNet = buildDailyNetMap(jackets, dealershipExpenses);

  return { totals, dailyNet, soldVehicleCount: jackets.length };
}

export async function getProfitLossReport(
  filters: PlFilters = DEFAULT_PL_FILTERS,
): Promise<ProfitLossReport> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return buildEmptyReport(filters);
  }

  const { dealershipId } = auth.user;
  const period = resolveCurrentPeriod(filters.dateRange);
  const comparisonPeriod = resolveComparisonPeriod(
    period,
    filters.compareTo,
    filters.dateRange,
  );

  const [current, previous] = await Promise.all([
    aggregateForPeriod(dealershipId, period.start, period.end, filters),
    filters.compareTo === "none"
      ? Promise.resolve({
          totals: { ...EMPTY_PERIOD_TOTALS },
          dailyNet: new Map<string, number>(),
          soldVehicleCount: 0,
        })
      : aggregateForPeriod(
          dealershipId,
          comparisonPeriod.start,
          comparisonPeriod.end,
          filters,
        ),
  ]);

  const dailyTrend = buildDailyTrendFromEvents(
    period.start,
    period.end,
    current.dailyNet,
  );

  const comparisonDailyTrend =
    filters.compareTo === "none"
      ? []
      : buildDailyTrendFromEvents(
          comparisonPeriod.start,
          comparisonPeriod.end,
          previous.dailyNet,
        );

  return buildProfitLossReport({
    thisMonth: current.totals,
    lastMonth: previous.totals,
    period: {
      start: period.start,
      end: period.end,
      label: period.label,
      columnLabel: period.columnLabel,
    },
    comparisonPeriod: {
      start: comparisonPeriod.start,
      end: comparisonPeriod.end,
      label: comparisonPeriod.label,
      columnLabel: comparisonPeriod.columnLabel,
    },
    dailyTrend,
    comparisonDailyTrend,
    soldVehicleCount: current.soldVehicleCount,
  });
}

function buildEmptyReport(filters: PlFilters): ProfitLossReport {
  const period = resolveCurrentPeriod(filters.dateRange);
  const comparisonPeriod = resolveComparisonPeriod(
    period,
    filters.compareTo,
    filters.dateRange,
  );

  return buildProfitLossReport({
    thisMonth: { ...EMPTY_PERIOD_TOTALS },
    lastMonth: { ...EMPTY_PERIOD_TOTALS },
    period: {
      start: period.start,
      end: period.end,
      label: period.label,
      columnLabel: period.columnLabel,
    },
    comparisonPeriod: {
      start: comparisonPeriod.start,
      end: comparisonPeriod.end,
      label: comparisonPeriod.label,
      columnLabel: comparisonPeriod.columnLabel,
    },
    dailyTrend: buildDailyTrendFromEvents(period.start, period.end, new Map()),
    comparisonDailyTrend: [],
    soldVehicleCount: 0,
  });
}

export async function getProfitLossFilterOptions(): Promise<PlFilterOptions> {
  const auth = await authenticateUser();
  const dateRangeOptions = buildDateRangeOptions();

  const defaults: PlFilterOptions = {
    dateRangeOptions,
    salesReps: [{ value: "all", label: "All" }],
    locations: [{ value: "all", label: "All" }],
    dealTypes: [
      { value: "all", label: "All" },
      { value: "cash", label: "Cash" },
      { value: "finance", label: "Finance" },
      { value: "lease", label: "Lease" },
    ],
  };

  if (!auth.ok) return defaults;

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const [usersResult, locationsResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name")
      .eq("dealership_id", dealershipId)
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .from("vehicles")
      .select("lot_location")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .not("lot_location", "is", null),
  ]);

  const salesReps = [
    { value: "all", label: "All" },
    ...(usersResult.data ?? []).map((u) => ({
      value: u.id as string,
      label: (u.full_name as string) ?? "Unknown",
    })),
  ];

  const locationSet = new Set<string>();
  for (const row of locationsResult.data ?? []) {
    const loc = row.lot_location as string | null;
    if (loc?.trim()) locationSet.add(loc.trim());
  }

  const locations = [
    { value: "all", label: "All" },
    ...[...locationSet].sort().map((loc) => ({ value: loc, label: loc })),
  ];

  return { dateRangeOptions, salesReps, locations, dealTypes: defaults.dealTypes };
}
