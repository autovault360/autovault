"use client";

import { Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
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

  return (
    <div className="space-y-2">
      {(hasKpiFilter || hasToolbarFilters) && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-[11px]">
          {hasKpiFilter && filters.kpiFilter !== "all" && (
            <span className="text-violet-300">
              FILTER APPLIED: {INVENTORY_KPI_LABELS[filters.kpiFilter]}
            </span>
          )}
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            theme="dark"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search VIN, Stock #, Year, Make, Model..."
            className="h-8 border-[#1e293b] pl-8 text-[11px]"
          />
        </div>

        <Select
          value={filters.inventoryStatus}
          onValueChange={(v) =>
            onInventoryStatusChange(v as WholesaleInventoryStatus | "all")
          }
        >
          <SelectTrigger theme="dark" className="h-8 w-[120px] border-[#1e293b] text-[11px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent theme="dark" className="border-[#1e293b]">
            <SelectItem value="all" theme="dark">
              All Status
            </SelectItem>
            {(Object.keys(INVENTORY_STATUS_LABELS) as WholesaleInventoryStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status} theme="dark">
                  {INVENTORY_STATUS_LABELS[status]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select value={filters.location} onValueChange={onLocationChange}>
          <SelectTrigger theme="dark" className="h-8 w-[120px] border-[#1e293b] text-[11px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent theme="dark" className="border-[#1e293b]">
            <SelectItem value="all" theme="dark">
              All Locations
            </SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc} theme="dark">
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.condition}
          onValueChange={(v) => onConditionChange(v as VehicleCondition | "all")}
        >
          <SelectTrigger theme="dark" className="h-8 w-[120px] border-[#1e293b] text-[11px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent theme="dark" className="border-[#1e293b]">
            <SelectItem value="all" theme="dark">
              All Conditions
            </SelectItem>
            {(Object.keys(CONDITION_LABELS) as VehicleCondition[]).map((c) => (
              <SelectItem key={c} value={c} theme="dark">
                {CONDITION_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          theme="dark"
          size="sm"
          className="h-8 border-[#1e293b] text-[11px]"
          onClick={onExport}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
