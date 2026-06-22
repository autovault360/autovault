"use client";

import { Calendar, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import { formatPeriodDateRange } from "./cpa-dashboard-utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - 2 + i,
);

export default function CpaDashboardHeader() {
  const { session, viewMode, setViewMode, month, year, setMonth, setYear } =
    useCpaPortal();

  if (!session) return null;

  const dateRangeLabel = formatPeriodDateRange(viewMode, month, year);

  return (
    <section className="mb-4 flex flex-col gap-4 border-b border-slate-800/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
      <PageHeaderTitle
        title="CPA Dashboard"
        subtitle="Financial Summary Overview"
        titleClassName="text-[22px] font-bold tracking-[0.08em] text-white uppercase"
        subtitleClassName="text-[12px] text-slate-500 normal-case tracking-normal"
      />

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0e1626] px-3 py-2">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="text-[12px] font-medium text-slate-200 tabular-nums">
              {dateRangeLabel}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </div>

          <div className="flex rounded-lg border border-slate-700/80 bg-[#0e1626] p-0.5">
            {(["monthly", "yearly"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-[12px] font-medium capitalize transition-colors",
                  viewMode === mode
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {viewMode === "monthly" && (
            <Select
              value={String(month)}
              onValueChange={(value) => setMonth(Number(value))}
            >
              <SelectTrigger
                theme="dark"
                className="h-9 w-[130px] border-slate-700/80 bg-[#0e1626] text-[11px] text-slate-300"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent theme="dark">
                {MONTHS.map((label, i) => (
                  <SelectItem
                    key={label}
                    value={String(i + 1)}
                    className="text-[11px]"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger
              theme="dark"
              className="h-9 w-[90px] border-slate-700/80 bg-[#0e1626] text-[11px] text-slate-300"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark">
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-[11px]">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
