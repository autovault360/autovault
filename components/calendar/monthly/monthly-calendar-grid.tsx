"use client";

import { cn } from "@/lib/utils";
import { SALES_REPS } from "@/lib/calendar/constants";
import {
  getUnitPillLabel,
  getUnitsColorTier,
} from "@/lib/calendar/selectors";
import { UNIT_PILL_STYLES } from "@/lib/calendar/constants";
import type { MonthGridCell } from "@/lib/calendar/types";
import { getInitials } from "@/lib/calendar/format-utils";
import { CalendarCardShell } from "../calendar-card-primitives";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  cells: MonthGridCell[];
  selectedDay: string | null;
  onDaySelect: (date: string) => void;
};

export default function MonthlyCalendarGrid({
  cells,
  selectedDay,
  onDaySelect,
}: Props) {
  return (
    <CalendarCardShell className="p-3">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium text-slate-500"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell.date || cell.dayNumber === null) {
            return <div key={`empty-${idx}`} className="min-h-[88px]" />;
          }
          const units = cell.activity?.unitsSold ?? 0;
          const tier = getUnitsColorTier(units);
          const pillLabel = getUnitPillLabel(units);
          const isSelected = selectedDay === cell.date;

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onDaySelect(cell.date!)}
              className={cn(
                "flex min-h-[88px] flex-col items-start justify-start rounded-[4px] border border-slate-800/60 bg-slate-900/20 p-1.5 text-left transition-colors hover:border-slate-600",
                isSelected && "ring-2 ring-blue-500 ring-offset-0",
              )}
            >
              <div className="shrink-0 text-[11px] font-semibold leading-none text-slate-300">
                {cell.dayNumber}
              </div>
              {pillLabel && (
                <div
                  className={cn(
                    "mt-1 inline-block rounded px-1 py-0.5 text-[9px] font-medium",
                    UNIT_PILL_STYLES[tier],
                  )}
                >
                  {pillLabel}
                </div>
              )}
              <div className="mt-0.5 w-full space-y-0.5">
                {cell.activity?.salesReps.map((rep) => {
                  const repMeta = SALES_REPS.find((r) => r.id === rep.repId);
                  return (
                    <div
                      key={rep.repId}
                      className="flex items-center gap-1 text-[8.5px] text-slate-400"
                    >
                      <span className="grid h-3.5 w-3.5 place-items-center rounded bg-slate-700 text-[7px] text-slate-300">
                        {repMeta?.initials ?? getInitials(rep.repName)}
                      </span>
                      <span className="truncate">{rep.repName.split(" ")[0]}</span>
                      <span className="ml-auto text-slate-500">{rep.unitsSold}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </CalendarCardShell>
  );
}
