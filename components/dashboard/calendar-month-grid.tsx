"use client";

import { cn } from "@/lib/utils";
import type { MonthGridCell } from "@/lib/calendar/types";
import { formatCurrency } from "@/lib/profit-loss/types";
import { getEventChipClass } from "./calendar-utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type Props = {
  cells: MonthGridCell[];
  selectedDay: string | null;
  today: string;
  onDaySelect: (date: string) => void;
  mode?: "events" | "sold";
};

export default function CalendarMonthGrid({
  cells,
  selectedDay,
  today,
  onDaySelect,
  mode = "events",
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
        {cells.map((cell, idx) => {
          if (!cell.date || cell.dayNumber === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[76px] border-b border-r border-slate-800/40 bg-card/80"
              />
            );
          }

          const events = cell.activity?.events ?? [];
          const units = cell.activity?.unitsSold ?? 0;
          const isSelected = selectedDay === cell.date;
          const isToday = cell.date === today;
          const isWeekend =
            new Date(`${cell.date}T00:00:00`).getDay() === 0 ||
            new Date(`${cell.date}T00:00:00`).getDay() === 6;

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onDaySelect(cell.date!)}
              className={cn(
                "flex min-h-[76px] flex-col items-stretch border-b border-r border-slate-800/40 p-1.5 text-left transition-colors",
                "hover:bg-slate-800/20",
                isSelected && "bg-blue-600/10",
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
                  {cell.dayNumber}
                </span>
                {mode === "events" && events.length > 0 && isSelected && (
                  <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[8px] font-medium text-blue-300">
                    {events.length} Event{events.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {mode === "events" ? (
                <div className="space-y-0.5 overflow-hidden">
                  {events.slice(0, 2).map((ev) => (
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
                  {events.length > 2 && (
                    <div className="text-[8px] text-slate-500">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              ) : units > 0 ? (
                <div className="mt-auto flex flex-col items-center gap-0.5">
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                    {units}
                  </span>
                  <span className="truncate text-[8px] text-[#d4e157]">
                    {formatCurrency(
                      cell.activity?.totalGross ?? 0,
                    )}
                  </span>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
