"use client";

import { useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalesRepProfileDateRange } from "@/lib/sales-reps/profile-types";

type Props = {
  dateRange: SalesRepProfileDateRange;
  onDateRangeChange: (range: SalesRepProfileDateRange) => void;
};

function shiftMonth(startIso: string, delta: number): SalesRepProfileDateRange {
  const start = new Date(startIso);
  start.setMonth(start.getMonth() + delta);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label,
  };
}

export default function SalesRepDateRangeFilter({
  dateRange,
  onDateRangeChange,
}: Props) {
  const handlePrev = useCallback(() => {
    onDateRangeChange(shiftMonth(dateRange.start, -1));
  }, [dateRange.start, onDateRangeChange]);

  const handleNext = useCallback(() => {
    onDateRangeChange(shiftMonth(dateRange.start, 1));
  }, [dateRange.start, onDateRangeChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-700 bg-[#0a101c]/60">
        <button
          type="button"
          onClick={handlePrev}
          className="flex h-9 w-9 items-center justify-center text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 items-center gap-2 border-x border-slate-700 px-3">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11.5px] font-medium text-slate-200">
            {dateRange.label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-9 w-9 items-center justify-center text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-9 gap-1.5 border-slate-700 bg-transparent px-3 text-[11.5px] font-medium text-slate-300 hover:bg-slate-800/50"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
      </Button>
    </div>
  );
}
