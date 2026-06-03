"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReportsDateRange, ReportsFilters } from "@/lib/reports-reminders/types";

const DATE_RANGES: { id: ReportsDateRange; label: string; icon?: boolean }[] = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom Range", icon: true },
];

const FILTER_OPTIONS = [
  { key: "salesRep" as const, label: "All Sales Reps" },
  { key: "vehicle" as const, label: "All Vehicles" },
  { key: "customer" as const, label: "All Customers" },
  { key: "category" as const, label: "All Categories" },
  { key: "dealJacket" as const, label: "All Deal Jackets" },
  { key: "state" as const, label: "All States" },
];

type Props = {
  filters: ReportsFilters;
  onChange: (filters: ReportsFilters) => void;
};

export default function ReportsRemindersFilters({ filters, onChange }: Props) {
  return (
    <section className="mb-3.5 flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-4 2xl:gap-6">
      <div className="shrink-0">
        <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
          DATE RANGE
        </div>
        <div className="inline-flex max-w-full flex-wrap gap-0 overflow-hidden rounded-md border border-slate-700 bg-[#0e1626] p-0.5">
          {DATE_RANGES.map((range) => {
            const active = filters.dateRange === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => onChange({ ...filters, dateRange: range.id })}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-[3px] px-2.5 py-1.5 text-[11px] font-medium transition",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                )}
              >
                {range.icon && <Calendar className="h-3 w-3 shrink-0" />}
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
          FILTER BY
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap xl:overflow-x-auto xl:pb-0.5">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <Select
              key={key}
              value={filters[key]}
              onValueChange={(v) => onChange({ ...filters, [key]: v })}
            >
              <SelectTrigger
                theme="dark"
                className="h-8 min-w-[118px] border-slate-700 bg-[#0e1626] px-2.5 text-[11px] text-slate-300"
              >
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent
                theme="dark"
                className="border-slate-800 bg-[#0e1626] text-slate-300"
              >
                <SelectItem value="all" className="text-[11px]">
                  {label}
                </SelectItem>
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>
    </section>
  );
}
