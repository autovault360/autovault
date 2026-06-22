"use client";

import { useState } from "react";
import Image from "next/image";
import { Filter, ArrowUpDown, Search, ChevronRight } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { IVehicleCard } from "@/lib/sales-rep/dashboard/types";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-12 w-20 shrink-0 animate-pulse rounded-md bg-slate-800/80" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-800/80" />
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-800/60" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-800/60" />
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-800/80" />
        <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-slate-800/60" />
      </div>
    </div>
  );
}

type Props = {
  inventory: IVehicleCard[];
  selectedVehicle: IVehicleCard | null;
  onSelect: (vehicle: IVehicleCard) => void;
  loading?: boolean;
};

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Sold: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        colorMap[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20",
      )}
    >
      {status === "Available" && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
      )}
      {status || "Available"}
    </span>
  );
}

function Separator() {
  return <span className="mx-1.5 h-0.5 w-0.5 rounded-full bg-slate-600" />;
}

export default function AvailableInventoryPanel({
  inventory,
  selectedVehicle,
  onSelect,
  loading,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = inventory.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.yearModel.toLowerCase().includes(q) ||
      v.stockNo.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q)
    );
  });

  return (
    <CardShell className="flex h-full flex-col border border-slate-700/60 p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-3">
        <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500">
          AVAILABLE INVENTORY
        </span>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-0 p-0 cursor-pointer"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Search & Controls */}
      <div className="flex gap-2 border-b border-slate-800/30 px-4 py-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search by make, model, stock, VIN..."
            value={search}
            theme="dark"
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-[12px]"
          />
        </div>
        <Button variant="outline" theme="dark" size="sm" className="h-8 px-2.5">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
        </Button>
        <Button variant="outline" theme="dark" size="sm" className="h-8 px-2.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
        </Button>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-800">
        {loading ? (
          <div className="divide-y divide-slate-800/30">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-2 h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No vehicles found</p>
            <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/30">
            {filtered.map((vehicle) => {
              const isSelected = selectedVehicle?.stockNo === vehicle.stockNo;
              return (
                <button
                  key={vehicle.stockNo}
                  type="button"
                  onClick={() => onSelect(vehicle)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-slate-800/20 bg-transparent border-0 cursor-pointer",
                    isSelected && "bg-blue-500/10 ring-1 ring-inset ring-blue-500/30",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-slate-900 ring-1 ring-slate-800/60">
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.yearModel}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-medium text-slate-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {/* Title + Price row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-white">
                        {vehicle.yearModel}
                      </span>
                      <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-white">
                        {formatCurrency(vehicle.price)}
                      </span>
                    </div>

                    {/* Stock + VIN row */}
                    <div className="flex flex-wrap items-center gap-0 text-[11px] text-slate-500">
                      <span>Stock #{vehicle.stockNo}</span>
                      <Separator />
                      <span className="font-mono text-slate-400">VIN {vehicle.vin}</span>
                    </div>

                    {/* Mileage + Type + Color + Status row */}
                    <div className="flex flex-wrap items-center gap-0 text-[11px] text-slate-400">
                      <span>{vehicle.mileage} mi</span>
                      <Separator />
                      <span>{vehicle.type}</span>
                      <Separator />
                      <span>{vehicle.color}</span>
                      <span className="ml-auto">
                        <StatusBadge status={vehicle.status || "Available"} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/50 px-4 py-2.5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 py-2 text-[11px] font-bold text-blue-400 hover:bg-slate-800/60 hover:text-blue-300 transition-colors"
        >
          View All Inventory
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </CardShell>
  );
}