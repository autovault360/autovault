"use client";

import CalendarActivityLegend from "./calendar-activity-legend";
import MonthlyCalendarGrid from "./monthly-calendar-grid";
import DayDetailPanel from "./day-detail-panel";
import MonthlyRightSidebar from "./monthly-right-sidebar";
import MonthlyBottomAnalytics from "./monthly-bottom-analytics";
import type {
  CalendarEventType,
  IDailySalesActivity,
  MonthGridCell,
  MonthlyTrendPoint,
  SalesRepLeaderboardEntry,
  SoldVehicleRow,
  UpcomingComplianceEvent,
  WeekBreakdownRow,
} from "@/lib/calendar/types";

type Props = {
  monthGrid: MonthGridCell[];
  selectedDay: string | null;
  selectedActivity: IDailySalesActivity | null;
  upcomingEvents: UpcomingComplianceEvent[];
  soldVehicles: SoldVehicleRow[];
  dayNote: string;
  weeklyBreakdown: WeekBreakdownRow[];
  topReps: SalesRepLeaderboardEntry[];
  trendData: MonthlyTrendPoint[];
  onDaySelect: (date: string) => void;
  onDayClose: () => void;
  onDayNoteChange: (note: string) => void;
  onAddEvent: (
    date: string,
    event: {
      title: string;
      type: CalendarEventType;
      time: string;
      description?: string;
    },
  ) => void;
};

export default function MonthlyCalendarView({
  monthGrid,
  selectedDay,
  selectedActivity,
  upcomingEvents,
  soldVehicles,
  dayNote,
  weeklyBreakdown,
  topReps,
  trendData,
  onDaySelect,
  onDayClose,
  onDayNoteChange,
  onAddEvent,
}: Props) {
  return (
    <>
      <CalendarActivityLegend />
      <section className="mb-3.5 grid gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <MonthlyCalendarGrid
            cells={monthGrid}
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
          />
        </div>
        <div className="xl:col-span-4">
          <DayDetailPanel
            activity={selectedActivity}
            date={selectedDay}
            onClose={onDayClose}
            onAddEvent={(ev) => selectedDay && onAddEvent(selectedDay, ev)}
          />
        </div>
        <div className="xl:col-span-3">
          <MonthlyRightSidebar
            upcomingEvents={upcomingEvents}
            soldVehicles={soldVehicles}
            dayNote={dayNote}
            onDayNoteChange={onDayNoteChange}
          />
        </div>
      </section>
      <MonthlyBottomAnalytics
        weeklyBreakdown={weeklyBreakdown}
        topReps={topReps}
        trendData={trendData}
      />
    </>
  );
}
