"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesRepDateRangeFilter from "./sales-rep-date-range-filter";
import type { SalesRepProfileDateRange } from "@/lib/sales-reps/profile-types";

type Props = {
  dateRange: SalesRepProfileDateRange;
  onDateRangeChange: (range: SalesRepProfileDateRange) => void;
};

export default function SalesRepProfileToolbar({
  dateRange,
  onDateRangeChange,
}: Props) {
  return (
    <div className="flex w-full shrink-0 flex-col items-stretch gap-2.5 xl:w-auto xl:items-end">
      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-9 border-slate-600/80 bg-transparent px-4 text-[12px] font-medium text-white hover:bg-slate-800/50"
        >
          Edit Sales Rep
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-9 gap-1.5 border-slate-600/80 bg-transparent px-4 text-[12px] font-medium text-white hover:bg-slate-800/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Change Commission Plan
        </Button>
        <div className="inline-flex overflow-hidden rounded-md">
          <Button
            type="button"
            size="lg"
            className="h-9 gap-1.5 rounded-r-none px-4 text-[12px] font-semibold"
          >
            Actions
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-9 w-9 rounded-l-none border-l border-blue-500/40 px-0"
            aria-label="More actions"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <SalesRepDateRangeFilter
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
    </div>
  );
}
