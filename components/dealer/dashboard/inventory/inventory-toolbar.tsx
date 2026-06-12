"use client";

import { Download, Search, SlidersHorizontal, X } from "lucide-react";
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
import {
  CONDITION_LABELS,
  INVENTORY_KPI_LABELS,
  INVENTORY_STATUS_LABELS,
} from "@/lib/dealer/inventory/inventory-constants";
import type {
  InventoryKpiFilterKey,
  VehicleCondition,
  WholesaleInventoryStatus,
} from "@/lib/dealer/dashboard/types";

export type InventoryToolbarFilters = {
  search: string;
  inventoryStatus: WholesaleInventoryStatus | "all";
  location: string;
  condition: VehicleCondition | "all";
  kpiFilter: InventoryKpiFilterKey;
};

export default function InventoryToolbar({
  filters,
  locations,
  onSearchChange,
  onInventoryStatusChange,
  onLocationChange,
  onConditionChange,
  onClearFilters,
  onExport,
}: {
  filters: InventoryToolbarFilters;
  locations: string[];
  onSearchChange: (value: string) => void;
  onInventoryStatusChange: (value: WholesaleInventoryStatus | "all") => void;
  onLocationChange: (value: string) => void;
  onConditionChange: (value: VehicleCondition | "all") => void;
  onClearFilters: () => void;
  onExport: () => void;
}) {
  const hasKpiFilter = filters.kpiFilter !== "all";
  const hasToolbarFilters =
    filters.search.trim() !== "" ||
    filters.inventoryStatus !== "all" ||
    filters.location !== "all" ||
    filters.condition !== "all";
  const hasActiveFilters = hasKpiFilter || hasToolbarFilters;

  return (
    <div className="space-y-2.5">
      {hasKpiFilter && filters.kpiFilter !== "all" && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-[11px]">
          <span className="text-violet-300">
            FILTER APPLIED: {INVENTORY_KPI_LABELS[filters.kpiFilter]}
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-blue-400 hover:underline"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <InputGroup theme="dark">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by Make, Model, Stock #, or VIN..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              theme="dark"
            />
          </InputGroup>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.inventoryStatus}
              onValueChange={(v) =>
                onInventoryStatusChange(v as WholesaleInventoryStatus | "all")
              }
            >
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">
                    All Statuses
                  </SelectItem>
                  {(Object.keys(INVENTORY_STATUS_LABELS) as WholesaleInventoryStatus[]).map(
                    (status) => (
                      <SelectItem key={status} value={status} theme="dark" className="text-[11.5px]">
                        {INVENTORY_STATUS_LABELS[status]}
                      </SelectItem>
                    ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={filters.location} onValueChange={onLocationChange}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Location</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">
                    All Locations
                  </SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc} theme="dark" className="text-[11.5px]">
                      {loc}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={filters.condition}
              onValueChange={(v) => onConditionChange(v as VehicleCondition | "all")}
            >
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Condition</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">
                    All Conditions
                  </SelectItem>
                  {(Object.keys(CONDITION_LABELS) as VehicleCondition[]).map((c) => (
                    <SelectItem key={c} value={c} theme="dark" className="text-[11.5px]">
                      {CONDITION_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" theme="dark" className="shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                theme="dark"
                onClick={onClearFilters}
                className="text-[11.5px]"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>

          <Button variant="outline" theme="dark" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
