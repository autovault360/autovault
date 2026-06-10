"use client";

import { useState } from "react";
import { Calendar, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { PlFilterOptions, PlFilters } from "@/lib/profit-loss/types";
import { DEFAULT_PL_FILTERS } from "@/lib/profit-loss/types";

type Props = {
  filters: PlFilters;
  filterOptions: PlFilterOptions;
  onChange: (filters: PlFilters) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          theme="dark"
          className="h-9 min-w-[130px] gap-1.5 border-slate-800 bg-card px-3 text-[11.5px] text-slate-300"
        >
          {icon}
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="border-slate-800 bg-card text-slate-300">
          <SelectGroup>
            <SelectLabel>
              {label}
            </SelectLabel>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[11.5px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

const COMPARE_OPTIONS = [
  { value: "last_month", label: "Last Month" },
  { value: "last_year", label: "Last Year" },
  { value: "none", label: "None" },
];

const GROUP_BY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sales_rep", label: "Sales Rep" },
  { value: "location", label: "Location" },
  { value: "deal_type", label: "Deal Type" },
];

export default function ProfitLossFilters({
  filters,
  filterOptions,
  onChange,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const update = (patch: Partial<PlFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <>
      <section className="mb-3.5 flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Date Range"
          value={filters.dateRange}
          options={filterOptions.dateRangeOptions}
          onValueChange={(v) => update({ dateRange: v as PlFilters["dateRange"] })}
          icon={<Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
        />
        <FilterSelect
          label="Compare To"
          value={filters.compareTo}
          options={COMPARE_OPTIONS}
          onValueChange={(v) => update({ compareTo: v as PlFilters["compareTo"] })}
        />
        <FilterSelect
          label="Group By"
          value={filters.groupBy}
          options={GROUP_BY_OPTIONS}
          onValueChange={(v) => update({ groupBy: v as PlFilters["groupBy"] })}
        />
        <FilterSelect
          label="Sales Rep"
          value={filters.salesRep}
          options={filterOptions.salesReps}
          onValueChange={(v) => update({ salesRep: v })}
        />
        <FilterSelect
          label="Location"
          value={filters.location}
          options={filterOptions.locations}
          onValueChange={(v) => update({ location: v })}
        />
        <FilterSelect
          label="Deal Type"
          value={filters.dealType}
          options={filterOptions.dealTypes}
          onValueChange={(v) => update({ dealType: v })}
        />
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 bg-card px-3.5 text-[11.5px] text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More Filters
        </button>
        {JSON.stringify(filters) !== JSON.stringify(DEFAULT_PL_FILTERS) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PL_FILTERS)}
            className="flex h-9 items-center gap-1 rounded-md border border-red-900/60 bg-red-950/30 px-3 text-[11px] text-red-400 hover:bg-red-950/50 hover:text-red-300"
          >
            Clear Filters
          </button>
        )}
      </section>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="right"
          className="border-slate-800 bg-card text-slate-200 sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="text-white">More Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
                Search categories
              </label>
              <InputGroup className="border-slate-700 bg-slate-800/50">
                <InputGroupInput
                  theme="dark"
                  placeholder="Search P&L categories..."
                  value={filters.search}
                  onChange={(e) => update({ search: e.target.value })}
                  className="text-[12px]"
                />
                <InputGroupAddon className="text-[11px] text-slate-500">Go</InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
