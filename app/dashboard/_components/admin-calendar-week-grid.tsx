"use client";

import { cn } from "@/lib/utils";
import type { IDailySalesActivity } from "@/lib/calendar/types";
import { getEventChipClass, type WeekDay } from "./admin-calendar-utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type Props = {
  days: WeekDay[];
  dailyMap: Map<string, IDailySalesActivity>;
  selectedDay: string | null;
  today: string;
  onDaySelect: (date: string) => void;
  focusMonth: string;
};

export default function AdminCalendarWeekGrid({
  days,
  dailyMap,
  selectedDay,
  today,
  onDaySelect,
  focusMonth,
}: Props) {
  return (
    <div className="rounded-sm border border-slate-800/80 bg-card p-2">
      <div className="grid grid-cols-7 border-b border-slate-800/80">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold tracking-wide text-slate-500"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const activity = dailyMap.get(day.date) ?? null;
          const events = activity?.events ?? [];
          const isSelected = selectedDay === day.date;
          const isToday = day.date === today;
          const isCurrentMonth = day.date.startsWith(focusMonth);
          const dayOfWeek = new Date(`${day.date}T00:00:00`).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onDaySelect(day.date)}
              className={cn(
                "flex min-h-[120px] flex-col items-stretch border-b border-r border-slate-800/40 p-1.5 text-left transition-colors",
                "hover:bg-slate-800/20",
                isSelected && "bg-blue-600/10",
                !isCurrentMonth && "opacity-40",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                    isSelected || isToday
                      ? "bg-blue-600 text-white"
                      : isWeekend
                        ? "text-red-400"
                        : "text-slate-300",
                  )}
                >
                  {day.dayNumber}
                </span>
                {events.length > 0 && (
                  <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[8px] font-medium text-blue-300">
                    {events.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {events.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    className={cn(
                      "truncate rounded border px-1 py-0.5 text-[8px] leading-tight",
                      getEventChipClass(ev.type),
                    )}
                  >
                    {ev.title}
                  </div>
                ))}
                {events.length > 4 && (
                  <div className="text-[8px] text-slate-500">
                    +{events.length - 4} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
