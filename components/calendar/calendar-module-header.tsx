"use client";

import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarViewMode } from "@/lib/calendar/types";
import { formatMonthYear } from "@/lib/calendar/format-utils";
import CalendarViewToggles from "./calendar-view-toggles";

type Props = {
  viewMode: CalendarViewMode;
  onViewChange: (mode: CalendarViewMode) => void;
  year: number;
  focusMonth: string;
  onYearChange: (year: number) => void;
  onMonthChange: (delta: number) => void;
  onToday: () => void;
  onFilter: () => void;
  onExport: () => void;
};

export default function CalendarModuleHeader({
  viewMode,
  onViewChange,
  year,
  focusMonth,
  onYearChange,
  onMonthChange,
  onToday,
  onFilter,
  onExport,
}: Props) {
  return (
    <section className="mb-3.5 space-y-3 px-0.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-bold tracking-[0.12em] text-white">CALENDAR</h1>
          </div>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Overview of daily sales activity, units sold, and commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "yearly" ? (
            <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-[#0e1626] px-1">
              <button
                type="button"
                onClick={() => onYearChange(year - 1)}
                className="grid h-7 w-7 place-items-center text-slate-400 hover:text-white"
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[48px] text-center text-[12.5px] font-medium text-slate-200">
                {year}
              </span>
              <button
                type="button"
                onClick={() => onYearChange(year + 1)}
                className="grid h-7 w-7 place-items-center text-slate-400 hover:text-white"
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-[#0e1626] px-1">
              <button
                type="button"
                onClick={() => onMonthChange(-1)}
                className="grid h-7 w-7 place-items-center text-slate-400 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] text-center text-[12.5px] font-medium text-slate-200">
                {formatMonthYear(focusMonth)}
              </span>
              <button
                type="button"
                onClick={() => onMonthChange(1)}
                className="grid h-7 w-7 place-items-center text-slate-400 hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-8 gap-1.5 border-slate-700 bg-transparent px-2.5 text-[11.5px] text-slate-300 hover:bg-slate-800/50"
          >
            <Calendar className="h-3.5 w-3.5" />
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFilter}
            className="h-8 gap-1.5 border-slate-700 bg-transparent px-2.5 text-[11.5px] text-slate-300 hover:bg-slate-800/50"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onExport}
            className="h-8 gap-1.5 bg-blue-600 px-3 text-[11.5px] text-white hover:bg-blue-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <CalendarViewToggles viewMode={viewMode} onViewChange={onViewChange} />
    </section>
  );
}

export { Car, TrendingUp, User };
