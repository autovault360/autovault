import CalendarPageContent from "@/components/calendar/calendar-page-content";
import {
  getCalendarFilterOptions,
  getCalendarReport,
} from "@/lib/calendar/server/get-calendar-report";

export default async function CalendarPage() {
  const currentYear = new Date().getFullYear();
  const [filterOptions, initialReport] = await Promise.all([
    getCalendarFilterOptions(),
    getCalendarReport(currentYear),
  ]);

  return (
    <CalendarPageContent
      initialReport={initialReport}
      filterOptions={filterOptions}
      initialYear={currentYear}
    />
  );
}
