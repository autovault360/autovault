"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { filterCalendar } from "@/lib/calendar/filter-calendar";
import {
  DEFAULT_CALENDAR_FILTERS,
  type CalendarEventType,
  type CalendarFilterOptions,
  type CalendarReport,
  type CalendarViewMode,
} from "@/lib/calendar/types";
import { addMonths } from "@/lib/calendar/format-utils";
import {
  getCalendarViewData,
  getDailyActivity,
  getDaySoldVehicles,
  getMonthlyPerformanceSummary,
} from "@/lib/calendar/selectors";
import {
  fetchCalendarReportAction,
  saveCalendarDayNoteAction,
  saveCalendarEventAction,
} from "@/lib/calendar/server/actions";
import { downloadCalendarCsv, exportCalendarPdf } from "@/lib/calendar/export-calendar";
import CalendarModuleHeader from "./calendar-module-header";
import CalendarKpiRibbon from "./calendar-kpi-ribbon";
import CalendarFilterDialog from "./calendar-filter-dialog";
import MonthlyCalendarView from "./monthly/monthly-calendar-view";
import YearlyCalendarView from "./yearly/yearly-calendar-view";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  initialReport: CalendarReport;
  filterOptions: CalendarFilterOptions;
  initialYear: number;
};

export default function CalendarPageContent({
  initialReport,
  filterOptions,
  initialYear,
}: Props) {
  const today = todayIso();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("monthly");
  const [year, setYear] = useState(initialYear);
  const [focusMonth, setFocusMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<string | null>(today);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [filters, setFilters] = useState(DEFAULT_CALENDAR_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [baseReport, setBaseReport] = useState<CalendarReport>(initialReport);
  const [dayNotes, setDayNotes] = useState<Record<string, string>>(
    initialReport.dayNotes,
  );
  const [isPending, startTransition] = useTransition();

  const filteredReport = useMemo(
    () => filterCalendar(filters, baseReport),
    [filters, baseReport],
  );

  const month = Number(focusMonth.slice(5, 7));
  const viewData = useMemo(
    () => getCalendarViewData(filters, filteredReport, year, month),
    [filters, filteredReport, year, month],
  );

  const selectedActivity = useMemo(() => {
    if (!selectedDay) return null;
    return getDailyActivity(selectedDay, viewData.dailyMap);
  }, [selectedDay, viewData.dailyMap]);

  const soldVehicles = useMemo(() => {
    if (!selectedDay) return viewData.monthSoldVehicles;
    return getDaySoldVehicles(selectedDay, filteredReport);
  }, [selectedDay, filteredReport, viewData.monthSoldVehicles]);

  const monthSummary = useMemo(() => {
    if (!selectedMonthId) return null;
    return getMonthlyPerformanceSummary(selectedMonthId, filteredReport);
  }, [selectedMonthId, filteredReport]);

  const kpis =
    viewMode === "monthly" ? viewData.monthlyKpis : viewData.yearlyKpis;

  const refetchReport = useCallback(
    (targetYear: number) => {
      startTransition(async () => {
        const report = await fetchCalendarReportAction(targetYear);
        setBaseReport(report);
        setDayNotes((prev) => ({ ...report.dayNotes, ...prev }));
      });
    },
    [],
  );

  const handleYearChange = useCallback(
    (nextYear: number) => {
      setYear(nextYear);
      refetchReport(nextYear);
    },
    [refetchReport],
  );

  const handleMonthChange = useCallback((delta: number) => {
    setFocusMonth((prev) => {
      const next = addMonths(prev, delta);
      const nextYear = Number(next.slice(0, 4));
      setYear(nextYear);
      if (nextYear !== year) {
        refetchReport(nextYear);
      }
      return next;
    });
  }, [year, refetchReport]);

  const handleToday = useCallback(() => {
    const now = todayIso();
    setFocusMonth(now.slice(0, 7));
    const nowYear = Number(now.slice(0, 4));
    setYear(nowYear);
    setSelectedDay(now);
    if (nowYear !== year) refetchReport(nowYear);
  }, [year, refetchReport]);

  const handleExport = useCallback(() => {
    downloadCalendarCsv(filteredReport, year);
    exportCalendarPdf();
    toast.success("Calendar report exported");
  }, [filteredReport, year]);

  const handleAddEvent = useCallback(
    async (
      date: string,
      event: {
        title: string;
        type: CalendarEventType;
        time: string;
        description?: string;
      },
    ) => {
      const result = await saveCalendarEventAction({ date, ...event });
      if (result.ok) {
        toast.success("Event saved");
        refetchReport(year);
      } else {
        toast.error(result.error ?? "Failed to save event");
      }
    },
    [year, refetchReport],
  );

  const handleDayNoteChange = useCallback(
    async (note: string) => {
      if (!selectedDay) return;
      setDayNotes((prev) => ({ ...prev, [selectedDay]: note }));
      const result = await saveCalendarDayNoteAction(selectedDay, note);
      if (!result.ok) {
        toast.error(result.error ?? "Failed to save note");
      }
    },
    [selectedDay],
  );

  return (
    <div className="calendar-page relative">
      {isPending && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-blue-500/80 animate-pulse" />
      )}

      <CalendarModuleHeader
        viewMode={viewMode}
        onViewChange={setViewMode}
        year={year}
        focusMonth={focusMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onToday={handleToday}
        onFilter={() => setFilterOpen(true)}
        onExport={handleExport}
      />

      <CalendarKpiRibbon kpis={kpis} />

      {viewMode === "monthly" ? (
        <MonthlyCalendarView
          monthGrid={viewData.monthGrid}
          selectedDay={selectedDay}
          selectedActivity={selectedActivity}
          upcomingEvents={filteredReport.upcomingEvents}
          soldVehicles={soldVehicles}
          dayNote={selectedDay ? (dayNotes[selectedDay] ?? baseReport.dayNotes[selectedDay] ?? "") : ""}
          weeklyBreakdown={viewData.weeklyBreakdown}
          topReps={viewData.topRepsMonth}
          trendData={viewData.monthlyTrendForMonth}
          onDaySelect={setSelectedDay}
          onDayClose={() => setSelectedDay(null)}
          onDayNoteChange={handleDayNoteChange}
          onAddEvent={handleAddEvent}
        />
      ) : (
        <YearlyCalendarView
          year={year}
          report={filteredReport}
          selectedMonthId={selectedMonthId}
          monthSummary={monthSummary}
          yearSummary={viewData.yearSummary}
          topReps={viewData.topRepsYear}
          bestMonths={viewData.bestMonths}
          quarterlyBars={viewData.quarterlyBars}
          monthlyTrend={viewData.monthlyTrend}
          monthlyCommissions={viewData.monthlyCommissionsTrend}
          onMonthSelect={setSelectedMonthId}
          onMonthSummaryClose={() => setSelectedMonthId(null)}
        />
      )}

      <CalendarFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        filterOptions={filterOptions}
        onApply={setFilters}
      />
    </div>
  );
}
