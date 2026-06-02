import type { CalendarFilters, CalendarReport, FilteredCalendarReport } from "./types";

export function filterCalendar(
  filters: CalendarFilters,
  report: CalendarReport,
): FilteredCalendarReport {
  let dailyActivity = report.dailyActivity;

  if (filters.salesRep !== "all") {
    dailyActivity = dailyActivity.map((day) => {
      const repActivities = day.salesReps.filter((r) => r.repId === filters.salesRep);
      if (repActivities.length === 0 && day.unitsSold > 0) {
        return { ...day, unitsSold: 0, totalGross: 0, totalCommissions: 0, salesReps: [], events: day.events };
      }
      const unitsSold = repActivities.reduce((s, r) => s + r.unitsSold, 0);
      const totalGross = repActivities.reduce((s, r) => s + r.grossProfit, 0);
      const totalCommissions = repActivities.reduce((s, r) => s + r.commissionsEarned, 0);
      return { ...day, unitsSold, totalGross, totalCommissions, salesReps: repActivities };
    });
  }

  return {
    ...report,
    dailyActivity,
  };
}
