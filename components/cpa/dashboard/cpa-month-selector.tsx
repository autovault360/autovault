"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import { formatPeriodStatusLine } from "./cpa-dashboard-utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CpaMonthSelector() {
  const { viewMode, month, year, setMonth, setYear } = useCpaPortal();

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  if (viewMode === "yearly") {
    return (
      <div className="mb-4 rounded-lg border border-slate-800/60 bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span>{formatPeriodStatusLine(viewMode, month, year)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-slate-800/60 bg-card px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Select Month
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-1">
              {MONTHS.map((label, i) => {
                const m = i + 1;
                const isActive = month === m;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setMonth(m)}
                    className={cn(
                      "flex min-w-[52px] flex-col items-center rounded-md px-2 py-1.5 transition-colors",
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-slate-500 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    <span className="text-[11px] font-medium">{label}</span>
                    <span
                      className={cn(
                        "text-[9px] tabular-nums",
                        isActive ? "text-violet-200" : "text-slate-600",
                      )}
                    >
                      {year}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-800/60 pt-2 text-[11px] text-slate-400">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span>{formatPeriodStatusLine(viewMode, month, year)}</span>
        </div>
      </div>
    </div>
  );
}
