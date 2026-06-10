"use client";

import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption, VehicleAlertFilterState } from "@/lib/sales-rep/vehicle-alerts/types";

const STATUS_OPTIONS = [
  { value: "pending_approval", label: "Pending Approval" },
  { value: "pending_documents", label: "Pending Documents" },
  { value: "under_review", label: "Under Review" },
  { value: "needs_changes", label: "Needs Changes" },
];

const ALERT_TYPE_OPTIONS = [
  { value: "vehicle_expiry", label: "Vehicle Expiry" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inventory", label: "Inventory" },
  { value: "registration", label: "Registration" },
  { value: "insurance", label: "Insurance" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "custom", label: "Custom" },
  { value: "pending_approval", label: "Pending Approval" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "oldest_first", label: "Oldest First" },
  { value: "newest_first", label: "Newest First" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "price_low", label: "Price: Low to High" },
];

type Props = {
  filters: VehicleAlertFilterState;
  makes: string[];
  searchError: string | null;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAlertTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onToggleAdvancedFilters: () => void;
  onClearFilters: () => void;
};

export default function VehicleAlertsToolbar({
  filters,
  makes,
  searchError,
  showAdvancedFilters,
  hasActiveFilters,
  onSearchChange,
  onMakeChange,
  onStatusChange,
  onAlertTypeChange,
  onPriorityChange,
  onSortChange,
  onToggleAdvancedFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2.5 rounded-sm border border-slate-700/80 bg-slate-900/30 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              theme="dark"
              placeholder="Search by Make, Model, Stock #, or Customer..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 border-slate-700/80 bg-slate-800/50 pl-8 text-[11px]"
              aria-invalid={!!searchError}
              maxLength={100}
            />
          </div>
          {searchError && (
            <p className="mt-1 text-[11px] text-red-400">{searchError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.make} onValueChange={onMakeChange}>
            <SelectTrigger theme="dark" className="h-8 w-auto min-w-[120px] text-[11px]">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Make</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Makes
                </SelectItem>
                {makes.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={onStatusChange}>
            <SelectTrigger theme="dark" className="h-8 w-auto min-w-[120px] text-[11px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Statuses
                </SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort}
            onValueChange={(v) => onSortChange(v as SortOption)}
          >
            <SelectTrigger theme="dark" className="h-8 w-auto min-w-[150px] text-[11px]">
              <SelectValue placeholder="Sort by: Oldest First" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Sort</SelectLabel>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            theme="dark"
            className="shrink-0"
            onClick={onToggleAdvancedFilters}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              theme="dark"
              onClick={onClearFilters}
              className="text-[11.5px]"
            >
              <X className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-slate-700/60 bg-slate-900/20 px-3 py-2.5">
          <Filter className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <Select value={filters.alertType} onValueChange={onAlertTypeChange}>
            <SelectTrigger theme="dark" className="h-8 w-[150px] text-[11px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" theme="dark" className="text-[11.5px]">
                All Alert Types
              </SelectItem>
              {ALERT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={onPriorityChange}>
            <SelectTrigger theme="dark" className="h-8 w-[130px] text-[11px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" theme="dark" className="text-[11.5px]">
                All Priorities
              </SelectItem>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
