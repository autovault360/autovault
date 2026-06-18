"use client";

import { cn } from "@/lib/utils";
import type { MonthStripDay } from "./calendar-utils";

type Props = {
  days: MonthStripDay[];
  selectedDay: string | null;
  onSelectDay: (date: string) => void;
  mode?: "events" | "sold";
};

export default function CalendarMonthStrip({
  days,
  selectedDay,
  onSelectDay,
  mode = "events",
}: Props) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-full gap-0">
        {days.map((d) => {
          const isSelected = selectedDay === d.date;
          const isHighlighted = d.isToday || isSelected;

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDay(d.date)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center px-0.5 py-1 transition-colors",
                "hover:bg-slate-800/30",
                isSelected && !d.isToday && "bg-blue-500/5",
              )}
            >
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide",
                  d.isWeekend ? "text-red-400/90" : "text-slate-500",
                )}
              >
                {d.weekday}
              </span>
              <span
                className={cn(
                  "mt-1 grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold tabular-nums",
                  isHighlighted
                    ? "bg-blue-600 text-white shadow-[0_0_0_2px_rgba(37,99,235,0.35)]"
                    : d.isWeekend
                      ? "text-red-400"
                      : "text-slate-200",
                )}
              >
                {d.day}
              </span>
              {d.eventCount > 0 && (
                <span className={cn(
                  "mt-0.5 h-1 w-1 rounded-full",
                  mode === "sold" ? "bg-emerald-400/80" : "bg-blue-400/80",
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
