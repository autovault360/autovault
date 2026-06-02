"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "@/components/layout/AdminHeader";
import { filterCalendar } from "@/lib/calendar/filter-calendar";
import { CALENDAR_MOCK_REPORT } from "@/lib/calendar/mock-data";
import {
  DEFAULT_CALENDAR_FILTERS,
  type CalendarEventType,
  type CalendarViewMode,
} from "@/lib/calendar/types";
import { addMonths } from "@/lib/calendar/format-utils";
import {
  getCalendarViewData,
  getDailyActivity,
  getDaySoldVehicles,
  getMonthlyPerformanceSummary,
} from "@/lib/calendar/selectors";
import CalendarModuleHeader from "./calendar-module-header";
import CalendarKpiRibbon from "./calendar-kpi-ribbon";
import CalendarFilterDialog from "./calendar-filter-dialog";
import MonthlyCalendarView from "./monthly/monthly-calendar-view";
import YearlyCalendarView from "./yearly/yearly-calendar-view";

const TODAY = "2025-05-20";
const DEFAULT_FOCUS_MONTH = "2025-05";
const DEFAULT_YEAR = 2025;

export default function CalendarPageContent() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("monthly");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [focusMonth, setFocusMonth] = useState(DEFAULT_FOCUS_MONTH);
  const [selectedDay, setSelectedDay] = useState<string | null>("2025-05-01");
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [filters, setFilters] = useState(DEFAULT_CALENDAR_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dayNotes, setDayNotes] = useState<Record<string, string>>(
    CALENDAR_MOCK_REPORT.dayNotes,
  );
  const [extraEvents, setExtraEvents] = useState<
    Record<string, Array<{ id: string; time: string; title: string; type: CalendarEventType; description?: string }>>
  >({});

  const filteredReport = useMemo(
    () => filterCalendar(filters, CALENDAR_MOCK_REPORT),
    [filters],
  );

  const month = Number(focusMonth.slice(5, 7));
  const viewData = useMemo(
    () => getCalendarViewData(filters, filteredReport, year, month),
    [filters, filteredReport, year, month],
  );

  const selectedActivity = useMemo(() => {
    if (!selectedDay) return null;
    const base = getDailyActivity(selectedDay, viewData.dailyMap);
    if (!base) return null;
    const added = extraEvents[selectedDay] ?? [];
    return { ...base, events: [...base.events, ...added] };
  }, [selectedDay, viewData.dailyMap, extraEvents]);

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

  const handleMonthChange = useCallback((delta: number) => {
    setFocusMonth((prev) => {
      const next = addMonths(prev, delta);
      setYear(Number(next.slice(0, 4)));
      return next;
    });
  }, []);

  const handleToday = useCallback(() => {
    setFocusMonth(TODAY.slice(0, 7));
    setYear(Number(TODAY.slice(0, 4)));
    setSelectedDay(TODAY);
  }, []);

  const handleExport = useCallback(() => {
    toast.success("Calendar report exported");
  }, []);

  const handleAddEvent = useCallback(
    (
      date: string,
      event: {
        title: string;
        type: CalendarEventType;
        time: string;
        description?: string;
      },
    ) => {
      const id = `ev-custom-${Date.now()}`;
      setExtraEvents((prev) => ({
        ...prev,
        [date]: [...(prev[date] ?? []), { ...event, id }],
      }));
      toast.success("Event saved");
    },
    [],
  );

  const handleDayNoteChange = useCallback((note: string) => {
    if (!selectedDay) return;
    setDayNotes((prev) => ({ ...prev, [selectedDay]: note }));
  }, [selectedDay]);

  return (
    <div className="calendar-page relative">
      <AdminHeader
        searchValue={filters.searchQuery}
        onSearchChange={(q) => setFilters((p) => ({ ...p, searchQuery: q }))}
      />

      <CalendarModuleHeader
        viewMode={viewMode}
        onViewChange={setViewMode}
        year={year}
        focusMonth={focusMonth}
        onYearChange={setYear}
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
          dayNote={selectedDay ? (dayNotes[selectedDay] ?? "") : ""}
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
        onApply={setFilters}
      />
    </div>
  );
}
