import type { CalendarFilters, CalendarReport, FilteredCalendarReport, IDailySalesActivity } from "./types";

function matchesSearch(row: { vehicle: string; customer: string; salesRep: string; stockNumber: string }, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase();
  return (
    row.vehicle.toLowerCase().includes(lower) ||
    row.customer.toLowerCase().includes(lower) ||
    row.salesRep.toLowerCase().includes(lower) ||
    row.stockNumber.toLowerCase().includes(lower)
  );
}

function filterSoldRows(filters: CalendarFilters, report: CalendarReport) {
  return report.soldVehicleRows.filter((row) => {
    if (filters.salesRep !== "all" && row.repId !== filters.salesRep) return false;
    if (filters.location !== "all" && row.lotLocation !== filters.location) return false;
    if (!matchesSearch(row, filters.searchQuery)) return false;
    return true;
  });
}

function rebuildDailyFromSoldRows(
  soldRows: CalendarReport["soldVehicleRows"],
  originalDaily: IDailySalesActivity[],
): IDailySalesActivity[] {
  const eventsByDate = new Map(originalDaily.map((d) => [d.date, d.events]));
  const byDate = new Map<string, typeof soldRows>();

  for (const row of soldRows) {
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }

  const dates = new Set([...byDate.keys(), ...originalDaily.map((d) => d.date)]);

  return [...dates]
    .sort()
    .map((date) => {
      const rows = byDate.get(date) ?? [];
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

      for (const row of rows) {
        const repId = row.repId ?? "unassigned";
        const existing = repMap.get(repId) ?? {
          repId,
          repName: row.salesRep,
          unitsSold: 0,
          grossProfit: 0,
          commissionsEarned: 0,
        };
        existing.unitsSold += 1;
        existing.grossProfit += row.profit;
        existing.commissionsEarned += row.commission;
        repMap.set(repId, existing);
      }

      return {
        id: `day-${date}`,
        date,
        unitsSold: rows.length,
        totalGross: rows.reduce((s, r) => s + r.profit, 0),
        totalCommissions: rows.reduce((s, r) => s + r.commission, 0),
        salesReps: [...repMap.values()],
        events: eventsByDate.get(date) ?? [],
      };
    })
    .filter((d) => d.unitsSold > 0 || d.events.length > 0);
}

export function filterCalendar(
  filters: CalendarFilters,
  report: CalendarReport,
): FilteredCalendarReport {
  const hasRowFilters =
    filters.salesRep !== "all" ||
    filters.location !== "all" ||
    filters.searchQuery.trim().length > 0;

  if (!hasRowFilters) {
    let dailyActivity = report.dailyActivity;
    if (filters.salesRep !== "all") {
      dailyActivity = dailyActivity.map((day) => {
        const repActivities = day.salesReps.filter((r) => r.repId === filters.salesRep);
        if (repActivities.length === 0 && day.unitsSold > 0) {
          return {
            ...day,
            unitsSold: 0,
            totalGross: 0,
            totalCommissions: 0,
            salesReps: [],
            events: day.events,
          };
        }
        const unitsSold = repActivities.reduce((s, r) => s + r.unitsSold, 0);
        const totalGross = repActivities.reduce((s, r) => s + r.grossProfit, 0);
        const totalCommissions = repActivities.reduce((s, r) => s + r.commissionsEarned, 0);
        return { ...day, unitsSold, totalGross, totalCommissions, salesReps: repActivities };
      });
    }
    return { ...report, dailyActivity };
  }

  const soldVehicleRows = filterSoldRows(filters, report);
  const dailyActivity = rebuildDailyFromSoldRows(soldVehicleRows, report.dailyActivity);

  const purchasedVehicleRows =
    filters.location === "all"
      ? report.purchasedVehicleRows
      : report.purchasedVehicleRows;

  return {
    ...report,
    dailyActivity,
    soldVehicleRows,
    purchasedVehicleRows,
  };
}
