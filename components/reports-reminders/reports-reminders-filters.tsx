"use client";

import { Calendar, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ReportsDateRange,
  ReportsFilterOptions,
  ReportsFilters,
} from "@/lib/reports-reminders/types";

const DATE_RANGES: { id: ReportsDateRange; label: string; icon?: boolean }[] = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom Range", icon: true },
];

const FILTER_OPTIONS: Array<{
  key: keyof Pick<ReportsFilters, "salesRep" | "vehicle" | "customer" | "category" | "dealJacket" | "state">;
  optionKey: keyof ReportsFilterOptions;
  label: string;
}> = [
  { key: "salesRep", optionKey: "salesReps", label: "All Sales Reps" },
  { key: "vehicle", optionKey: "vehicles", label: "All Vehicles" },
  { key: "customer", optionKey: "customers", label: "All Customers" },
  { key: "category", optionKey: "categories", label: "All Categories" },
  { key: "dealJacket", optionKey: "dealJackets", label: "All Deal Jackets" },
  { key: "state", optionKey: "states", label: "All States" },
];

type Props = {
  filters: ReportsFilters;
  options?: ReportsFilterOptions;
  onChange: (filters: ReportsFilters) => void;
};

export default function ReportsRemindersFilters({ filters, options, onChange }: Props) {
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
          <div className="relative min-w-[190px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={filters.search ?? ""}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Search reports..."
              className="h-8 w-full rounded-md border border-slate-700 bg-[#0e1626] pl-8 pr-2.5 text-[11px] text-slate-300 outline-none placeholder:text-slate-600 focus-visible:border-blue-500"
            />
          </div>
          {FILTER_OPTIONS.map(({ key, optionKey, label }) => (
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
                {(options?.[optionKey] ?? [{ value: "all", label }]).map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[11px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>
    </section>
  );
}
