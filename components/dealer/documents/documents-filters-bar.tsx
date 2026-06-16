"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WHOLESALE_DOCUMENT_TYPES,
  WHOLESALE_DOCUMENT_TYPE_LABELS,
} from "@/lib/dealer/documents/constants";
import type { WholesaleDocumentListParams } from "@/lib/dealer/documents/types";

export type VehicleFilterOption = {
  id: string;
  label: string;
};

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: WholesaleDocumentListParams;
  onFiltersChange: (filters: Partial<WholesaleDocumentListParams>) => void;
  vehicles: VehicleFilterOption[];
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  onClearFilters: () => void;
  showDeleted: boolean;
  onShowDeletedChange: (value: boolean) => void;
};

export default function DocumentsFiltersBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  vehicles,
  filtersOpen,
  onFiltersOpenChange,
  onClearFilters,
  showDeleted,
  onShowDeletedChange,
}: Props) {
  const hasFilters =
    search.trim() !== "" ||
    (filters.documentType && filters.documentType !== "all") ||
    (filters.vehicleId && filters.vehicleId !== "all") ||
    showDeleted;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 w-full max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            theme="dark"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.documentType ?? "all"}
            onValueChange={(v) =>
              onFiltersChange({
                documentType: v as WholesaleDocumentListParams["documentType"],
              })
            }
          >
            <SelectTrigger
              theme="dark"
            >
              <SelectValue placeholder="All Document Types" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11.5px]">
                All Document Types
              </SelectItem>
              {WHOLESALE_DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-[11.5px]">
                  {WHOLESALE_DOCUMENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.vehicleId ?? "all"}
            onValueChange={(v) =>
              onFiltersChange({
                vehicleId: v as WholesaleDocumentListParams["vehicleId"],
              })
            }
          >
            <SelectTrigger
              theme="dark"
            >
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11.5px]">
                All Vehicles
              </SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-[11.5px]">
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 gap-1.5 border-slate-700/80 bg-[#0a101c]/60 text-[11.5px] text-slate-300 hover:bg-slate-800",
              filtersOpen && "border-emerald-500/40 text-emerald-400",
            )}
            onClick={() => onFiltersOpenChange(!filtersOpen)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
        </div>
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700/60 bg-[#070c14]/50 p-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-slate-700 text-[11px]",
              showDeleted && "border-orange-500/50 text-orange-400",
            )}
            onClick={() => onShowDeletedChange(!showDeleted)}
          >
            {showDeleted ? "Showing Deleted" : "Show Deleted"}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[11px] text-slate-400 hover:text-white"
              onClick={onClearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
