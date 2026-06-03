import {
  aggregatePeriodTotals,
  type RawDealJacket,
  type RawDealershipExpense,
  type RawVehicleExpense,
} from "@/lib/profit-loss/server/aggregate-pl-data";
import type {
  CalendarEventType,
  CalendarReport,
  IDailySalesActivity,
  IMonthlySummaryMetrics,
  MonthFinancials,
  PurchasedVehicleRow,
  SoldVehicleRow,
  UpcomingComplianceEvent,
} from "../types";
import {
  type CalendarJacketRow,
  type CalendarVehicleRow,
  fetchCalendarJackets,
  fetchCalendarVehiclesAcquired,
  fetchInventoryCounts,
} from "./fetch-calendar-jackets";
import {
  eventRowToDailyEvent,
  eventsToDailyMap,
  eventsToUpcoming,
  fetchCalendarDayNotes,
  fetchCalendarEventsFromDb,
  fetchDerivedCalendarEvents,
  type CalendarEventRow,
} from "./fetch-calendar-events";
import { getYearlyComplianceEvents } from "@/lib/state-tax/server/get-filing-deadlines";

function mapJacketToRaw(j: CalendarJacketRow): RawDealJacket {
  return {
    sold_price: j.sold_price,
    total_invested: j.total_invested,
    profit_gross: j.profit_gross,
    profit_net: j.profit_net,
    commission_amount: j.commission_amount,
    total_tax: j.total_tax,
    date_sold: j.date_sold,
    vehicle_id: j.vehicle_id,
    amount_financed: j.amount_financed,
    acquisition_cost: null,
  };
}

function vehicleLabel(v: { year: number; make: string; model: string }): string {
  return `${v.year} ${v.make} ${v.model}`.trim();
}

function mapStatus(status: string): PurchasedVehicleRow["status"] {
  if (status === "in_recon") return "In Recon";
  if (status === "sold") return "Sold";
  return "In Stock";
}

export function jacketToSoldRow(j: CalendarJacketRow): SoldVehicleRow {
  return {
    id: j.id,
    date: j.date_sold,
    stockNumber: j.stock_number ? `#${j.stock_number}` : "N/A",
    vehicle: vehicleLabel(j),
    customer: j.customer_name,
    salesRep: j.sales_rep_name ?? "Unassigned",
    repId: j.sales_rep_id ?? undefined,
    lotLocation: j.lot_location,
    profit: j.profit_gross,
    commission: j.commission_amount,
  };
}

export function vehicleToPurchasedRow(v: CalendarVehicleRow): PurchasedVehicleRow {
  return {
    id: v.id,
    date: v.acquisition_date,
    stockNumber: v.stock_number ? `#${v.stock_number}` : "N/A",
    vehicle: vehicleLabel(v),
    cost: v.acquisition_cost,
    status: mapStatus(v.status),
  };
}

function buildDailyActivity(
  jackets: CalendarJacketRow[],
  eventsByDate: Map<string, CalendarEventRow[]>,
): IDailySalesActivity[] {
  const byDate = new Map<string, CalendarJacketRow[]>();
  for (const j of jackets) {
    const list = byDate.get(j.date_sold) ?? [];
    list.push(j);
    byDate.set(j.date_sold, list);
  }

  const allDates = new Set([...byDate.keys(), ...eventsByDate.keys()]);

  return [...allDates]
    .sort()
    .map((date) => {
      const dayJackets = byDate.get(date) ?? [];
      const repMap = new Map<
        string,
        {
          repId: string;
          repName: string;
          unitsSold: number;
          grossProfit: number;
          commissionsEarned: number;
        }
      >();

      for (const j of dayJackets) {
        const repId = j.sales_rep_id ?? "unassigned";
        const repName = j.sales_rep_name ?? "Unassigned";
        const existing = repMap.get(repId) ?? {
          repId,
          repName,
          unitsSold: 0,
          grossProfit: 0,
          commissionsEarned: 0,
        };
        existing.unitsSold += 1;
        existing.grossProfit += j.profit_gross;
        existing.commissionsEarned += j.commission_amount;
        repMap.set(repId, existing);
      }

      const events = (eventsByDate.get(date) ?? []).map(eventRowToDailyEvent);

      return {
        id: `day-${date}`,
        date,
        unitsSold: dayJackets.length,
        totalGross: dayJackets.reduce((s, j) => s + j.profit_gross, 0),
        totalCommissions: dayJackets.reduce((s, j) => s + j.commission_amount, 0),
        salesReps: [...repMap.values()],
        events,
      };
    });
}

function buildMonthlySummaries(
  jackets: CalendarJacketRow[],
  vehicles: CalendarVehicleRow[],
  dealershipExpenses: RawDealershipExpense[],
  vehicleExpenses: RawVehicleExpense[],
  inventory: { inStock: number; inRecon: number; totalInvested: number },
): {
  summaries: IMonthlySummaryMetrics[];
  monthFinancials: Record<string, MonthFinancials>;
} {
  const monthIds = new Set<string>();
  for (const j of jackets) monthIds.add(j.date_sold.slice(0, 7));
  for (const v of vehicles) monthIds.add(v.acquisition_date.slice(0, 7));

  const summaries: IMonthlySummaryMetrics[] = [];
  const monthFinancials: Record<string, MonthFinancials> = {};

  for (const monthId of [...monthIds].sort()) {
    const monthJackets = jackets.filter((j) => j.date_sold.startsWith(monthId));
    const monthVehicles = vehicles.filter((v) =>
      v.acquisition_date.startsWith(monthId),
    );
    const monthStart = `${monthId}-01`;
    const [y, m] = monthId.split("-").map(Number);
    const monthEnd = new Date(y!, m!, 0).toISOString().slice(0, 10);

    const monthDealershipExp = dealershipExpenses.filter(
      (e) => e.expense_date >= monthStart && e.expense_date <= monthEnd,
    );
    const monthVehicleExp = vehicleExpenses.filter(
      (e) => e.repair_date >= monthStart && e.repair_date <= monthEnd,
    );

    const rawJackets = monthJackets.map(mapJacketToRaw);
    const totals = aggregatePeriodTotals(rawJackets, monthVehicleExp, monthDealershipExp);

    const unitsSold = monthJackets.length;
    const unitsBought = monthVehicles.length;
    const totalGross = totals.vehicle_sales;
    const cogs = totals.total_cogs;
    const grossProfit = totals.gross_profit;
    const totalExpenses = totals.total_expenses;
    const netProfit = totals.net_profit;
    const totalCommissions = monthJackets.reduce(
      (s, j) => s + j.commission_amount,
      0,
    );

    const monthName = new Date(y!, m! - 1, 1).toLocaleDateString("en-US", {
      month: "long",
    });

    const vehicleGroups = new Map<string, { units: number; gross: number; imageUrl: string }>();
    for (const j of monthJackets) {
      const key = vehicleLabel(j);
      const existing = vehicleGroups.get(key) ?? { units: 0, gross: 0, imageUrl: "" };
      existing.units += 1;
      existing.gross += j.profit_gross;
      vehicleGroups.set(key, existing);
    }

    const topVehicles = [...vehicleGroups.entries()]
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5)
      .map(([makeModel, stats], i) => ({
        vehicleId: `veh-${monthId}-${i}`,
        makeModel,
        imageUrl: stats.imageUrl || "/placeholder-vehicle.png",
        unitsSold: stats.units,
        grossProfit: stats.gross,
      }));

    const repMap = new Map<
      string,
      { repId: string; repName: string; units: number; gross: number; comm: number }
    >();
    for (const j of monthJackets) {
      const repId = j.sales_rep_id ?? "unassigned";
      const repName = j.sales_rep_name ?? "Unassigned";
      const ex = repMap.get(repId) ?? { repId, repName, units: 0, gross: 0, comm: 0 };
      ex.units += 1;
      ex.gross += j.profit_gross;
      ex.comm += j.commission_amount;
      repMap.set(repId, ex);
    }

    const missingDocuments = monthJackets.filter((j) => j.document_count === 0).length;

    monthFinancials[monthId] = {
      payrollPaid: totals.payroll,
      salesTaxCollected: totals.sales_tax_collected,
      cdtfaObligations: Math.round(totals.sales_tax_collected * 0.9),
      missingDocuments,
      overdueFollowUps: 0,
      inventoryRemaining: inventory.inStock + inventory.inRecon,
      inventoryAdded: monthVehicles.length,
      salesByRep: [...repMap.values()].map((r) => ({
        repId: r.repId,
        repName: r.repName,
        unitsSold: r.units,
        grossProfit: r.gross,
        commissions: r.comm,
      })),
    };

    summaries.push({
      monthId,
      monthName,
      unitsSold,
      unitsBought,
      totalGross,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      averageGrossPerUnit: unitsSold > 0 ? Math.round(totalGross / unitsSold) : 0,
      averageProfitPerUnit: unitsSold > 0 ? Math.round(netProfit / unitsSold) : 0,
      totalCommissions,
      topVehicles,
    });
  }

  return { summaries, monthFinancials };
}

export type BuildCalendarInput = {
  jackets: CalendarJacketRow[];
  vehicles: CalendarVehicleRow[];
  dealershipExpenses: RawDealershipExpense[];
  vehicleExpenses: RawVehicleExpense[];
  dbEvents: CalendarEventRow[];
  derivedEvents: CalendarEventRow[];
  dayNotes: Record<string, string>;
  inventory: { inStock: number; inRecon: number; totalInvested: number };
  rangeFrom: string;
  rangeTo: string;
};

export function buildCalendarReport(input: BuildCalendarInput): CalendarReport {
  const allEvents = [...input.dbEvents, ...input.derivedEvents];
  const eventsByDate = eventsToDailyMap(allEvents);
  const dailyActivity = buildDailyActivity(input.jackets, eventsByDate);
  const { summaries, monthFinancials } = buildMonthlySummaries(
    input.jackets,
    input.vehicles,
    input.dealershipExpenses,
    input.vehicleExpenses,
    input.inventory,
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = eventsToUpcoming(allEvents, 10);
  const yearEnd = `${Number(input.rangeTo.slice(0, 4)) + 1}-12-31`;
  const yearlyCompliance = getYearlyComplianceEvents(today, yearEnd);

  const yearlyEvents: UpcomingComplianceEvent[] = yearlyCompliance.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    status:
      e.date <= today
        ? "urgent"
        : new Date(e.date).getTime() - Date.now() < 30 * 86400000
          ? "upcoming"
          : "scheduled",
  }));

  return {
    dailyActivity,
    monthlySummaries: summaries,
    upcomingEvents,
    yearlyEvents,
    dayNotes: input.dayNotes,
    soldVehicleRows: input.jackets.map(jacketToSoldRow),
    purchasedVehicleRows: input.vehicles.map(vehicleToPurchasedRow),
    monthFinancials,
  };
}

export async function loadCalendarDataForRange(
  dealershipId: string,
  from: string,
  to: string,
): Promise<BuildCalendarInput> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const jackets = await fetchCalendarJackets(dealershipId, from, to);
  const vehicles = await fetchCalendarVehiclesAcquired(dealershipId, from, to);
  const inventory = await fetchInventoryCounts(dealershipId);

  const vehicleIds = [...new Set(jackets.map((j) => j.vehicle_id))];

  const [dealershipExpResult, vehicleExpResult, dbEvents, derivedEvents, dayNotes] =
    await Promise.all([
      supabase
        .from("dealership_expenses")
        .select("category, amount, expense_date")
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .gte("expense_date", from)
        .lte("expense_date", to),
      vehicleIds.length > 0
        ? supabase
            .from("vehicle_expenses")
            .select("vehicle_id, total_cost, category, repair_type, repair_date")
            .eq("dealership_id", dealershipId)
            .is("deleted_at", null)
            .in("vehicle_id", vehicleIds)
            .gte("repair_date", from)
            .lte("repair_date", to)
        : Promise.resolve({ data: [], error: null }),
      fetchCalendarEventsFromDb(dealershipId, from, to),
      fetchDerivedCalendarEvents(dealershipId, from, to),
      fetchCalendarDayNotes(dealershipId, from, to),
    ]);

  const dealershipExpenses: RawDealershipExpense[] = (dealershipExpResult.data ?? []).map(
    (row) => ({
      category: row.category as string,
      amount: Number(row.amount),
      expense_date: row.expense_date as string,
    }),
  );

  const vehicleExpenses: RawVehicleExpense[] = (vehicleExpResult.data ?? []).map((row) => ({
    vehicle_id: row.vehicle_id as string,
    total_cost: Number(row.total_cost),
    category: (row.category as string) ?? "",
    repair_type: (row.repair_type as string) ?? "",
    repair_date: row.repair_date as string,
  }));

  return {
    jackets,
    vehicles,
    dealershipExpenses,
    vehicleExpenses,
    dbEvents,
    derivedEvents,
    dayNotes,
    inventory,
    rangeFrom: from,
    rangeTo: to,
  };
}

export function buildCalendarReportForDealership(
  dealershipId: string,
  year: number,
): Promise<CalendarReport> {
  const from = `${year - 1}-01-01`;
  const to = `${year}-12-31`;
  return loadCalendarDataForRange(dealershipId, from, to).then((input) =>
    buildCalendarReport(input),
  );
}
