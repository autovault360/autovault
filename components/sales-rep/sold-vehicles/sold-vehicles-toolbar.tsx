"use client";

import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SoldVehicleFilterState } from "@/lib/sales-rep/sold-vehicles/types";

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
];

type Props = {
  filters: SoldVehicleFilterState;
  makes: string[];
  models: string[];
  searchError: string | null;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToggleAdvancedFilters: () => void;
  onClearFilters: () => void;
};

export default function SoldVehiclesToolbar({
  filters,
  makes,
  models,
  searchError,
  showAdvancedFilters,
  hasActiveFilters,
  onSearchChange,
  onMakeChange,
  onModelChange,
  onStatusChange,
  onToggleAdvancedFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2.5 rounded-sm border border-slate-700/80 bg-slate-900/30 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <InputGroup theme="dark">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by Make, Model, Stock #, or Customer..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              theme="dark"
              aria-invalid={!!searchError}
              maxLength={100}
            />
          </InputGroup>
          {searchError && (
            <p className="mt-1 text-[11px] text-red-400">{searchError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.make} onValueChange={onMakeChange}>
            <SelectTrigger theme="dark" className="w-auto min-w-[120px]">
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

          <Select value={filters.model} onValueChange={onModelChange}>
            <SelectTrigger theme="dark" className="w-auto min-w-[120px]">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Model</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Models
                </SelectItem>
                {models.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={onStatusChange}>
            <SelectTrigger theme="dark" className="w-auto min-w-[120px]">
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
        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-slate-700/60 bg-slate-900/20 px-3 py-2.5">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-400">
            Advanced filters active. Combine search with make, model, and status for precise results.
          </span>
        </div>
      )}
    </div>
  );
}
