"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent, ViewAllModalView } from "@/lib/reminders/types";
import { addDays, formatDayHeader, formatWeekRange } from "@/lib/reminders/format-utils";
import { getWeekDays } from "@/lib/reminders/selectors";
import {
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";

type Props = {
  events: CalendarEvent[];
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
  onThisWeek: () => void;
  onViewAll: (view: ViewAllModalView) => void;
};

export default function ReminderCalendar({
  events,
  weekStart,
  onWeekChange,
  onThisWeek,
  onViewAll,
}: Props) {
  const weekDays = getWeekDays(weekStart);

  const eventsForWeek = events.map((ev) => {
    const startIdx = weekDays.indexOf(ev.start);
    const endIdx = weekDays.indexOf(ev.end);
    const dayIndex = startIdx >= 0 ? startIdx : ev.dayIndex;
    const spanDays =
      startIdx >= 0 && endIdx >= 0 ? endIdx - startIdx + 1 : ev.spanDays;
    return { ...ev, dayIndex, spanDays };
  });

  return (
    <ReminderCardShell>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          CALENDAR VIEW
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <span className="mr-1 hidden sm:inline">{formatWeekRange(weekStart)}</span>
          <button
            type="button"
            onClick={() => onWeekChange(addDays(weekStart, -7))}
            className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(addDays(weekStart, 7))}
            className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800"
            aria-label="Next week"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onThisWeek}
            className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[11px] hover:bg-slate-800"
          >
            This Week
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] text-slate-500"
              >
                {formatDayHeader(day)}
              </div>
            ))}
          </div>
          <div className="relative mt-1 grid min-h-[80px] grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={`cell-${day}`}
                className="min-h-[72px] rounded-[4px] border border-slate-800/60 bg-slate-900/20"
              />
            ))}
            {eventsForWeek.map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  "absolute top-1 flex flex-col rounded-md px-1.5 py-1 text-[9px] leading-tight text-white",
                  ev.color,
                )}
                style={{
                  left: `calc(${(ev.dayIndex / 7) * 100}% + 2px)`,
                  width: `calc(${(ev.spanDays / 7) * 100}% - 4px)`,
                }}
              >
                <span className="font-semibold">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ReminderViewMore
        label="View Full Calendar"
        onClick={() => onViewAll("calendar")}
      />
    </ReminderCardShell>
  );
}
