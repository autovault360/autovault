"use client";

import CalendarActivityLegend from "./calendar-activity-legend";
import MonthlyCalendarGrid from "./monthly-calendar-grid";
import DayDetailPanel from "./day-detail-panel";
import MonthlyRightSidebar from "./monthly-right-sidebar";
import {
  MonthlySalesByWeekCard,
  MonthlySalesTrendChart,
  MonthlyTopRepsCard,
} from "./monthly-bottom-analytics";
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
        {/* Main calendar */}
        <div className="xl:col-span-6 xl:row-start-1">
          <MonthlyCalendarGrid
            cells={monthGrid}
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
          />
        </div>

        {/* Day detail panel */}
        <div className="xl:col-span-3 xl:row-start-1">
          <DayDetailPanel
            activity={selectedActivity}
            date={selectedDay}
            onClose={onDayClose}
            onAddEvent={(ev) => selectedDay && onAddEvent(selectedDay, ev)}
          />
        </div>

        {/* Right sidebar - full height, standalone column */}
        <div className="xl:col-span-3 xl:row-span-2 xl:row-start-1 xl:self-start">
          <MonthlyRightSidebar
            upcomingEvents={upcomingEvents}
            soldVehicles={soldVehicles}
            dayNote={dayNote}
            onDayNoteChange={onDayNoteChange}
          />
        </div>

        {/* Bottom left: weekly, top reps, sales trend in one row */}
        <div className="grid gap-3.5 xl:col-span-9 xl:col-start-1 xl:row-start-2 xl:grid-cols-3">
          <MonthlySalesByWeekCard weeklyBreakdown={weeklyBreakdown} />
          <MonthlyTopRepsCard topReps={topReps} />
          <MonthlySalesTrendChart trendData={trendData} />
        </div>
      </section>
    </>
  );
}
