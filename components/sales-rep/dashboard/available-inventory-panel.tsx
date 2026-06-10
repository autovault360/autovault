"use client";

import { useState } from "react";
import Image from "next/image";
import { Filter, ArrowUpDown, Search } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { IVehicleCard } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-slate-800/80", className)} />
  );
}

type Props = {
  inventory: IVehicleCard[];
  selectedVehicle: IVehicleCard | null;
  onSelect: (vehicle: IVehicleCard) => void;
  loading?: boolean;
};

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
    <CardShell className="p-4 flex flex-col border border-slate-800/60 rounded-xl h-full justify-between">
      <div>
        {/* 1. Panel Header Ribbon */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.15em] text-slate-500">
            AVAILABLE INVENTORY
          </span>
          <button
            type="button"
            className="text-[13px] font-bold text-blue-500 hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            View All Inventory
          </button>
        </div>

        {/* 2. Compact Search & Controls Array */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by Make, Model, Stock #, VIN..."
              value={search}
              theme="dark"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            theme="dark"
          >
            <Filter className="mr-1 h-3 w-3 text-slate-500" />
            Filters
          </Button>
          <Button
            variant="outline"
            theme="dark"
          >
            <ArrowUpDown className="mr-1 h-3 w-3 text-slate-500" />
            Sort
          </Button>
        </div>

        {/* 3. Dense High-Parity List Container */}
        <div className="max-h-[380px] space-y-3.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-1">
                <SkeletonBar className="h-11 w-16 shrink-0 rounded" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBar className="h-3 w-1/3" />
                  <SkeletonBar className="h-2 w-2/3" />
                </div>
                <div className="space-y-1.5 flex flex-col items-end">
                  <SkeletonBar className="h-3 w-12" />
                  <SkeletonBar className="h-2 w-8" />
                </div>
              </div>
            ))
            : filtered.map((vehicle) => {
              const isSelected = selectedVehicle?.stockNo === vehicle.stockNo;
              return (
                <button
                  key={vehicle.stockNo}
                  type="button"
                  onClick={() => onSelect(vehicle)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 text-left transition-all border-b border-slate-800/20 pb-3 last:border-0 last:pb-0 group bg-transparent border-t-0 border-x-0 rounded-none px-1",
                    isSelected && "bg-blue-500/5 ring-1 ring-blue-500/20 rounded-md p-1.5 -mx-1"
                  )}
                >
                  {/* Left: Thumbnail & Descriptive Metadata block */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-slate-900 border border-slate-800/40">
                      {vehicle.imageUrl ? (
                        <Image
                          src={vehicle.imageUrl}
                          alt={vehicle.yearModel}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[8px] text-slate-600">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-bold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                        {vehicle.yearModel}
                      </div>
                      <div className="mt-1 text-[10px] font-medium text-slate-500 flex flex-wrap items-center gap-x-1 gap-y-0.5 leading-none">
                        <span>Stock # {vehicle.stockNo}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-slate-400 font-mono">VIN {vehicle.vin}</span>
                      </div>
                      <div className="mt-1 text-[13px] font-semibold text-slate-400 flex items-center gap-1 leading-none">
                        <span>{vehicle.mileage} mi</span>
                        <span className="text-slate-700 font-normal">•</span>
                        <span>{vehicle.type}</span>
                        <span className="text-slate-700 font-normal">•</span>
                        <span>{vehicle.color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Explicit Pricing Display Node */}
                  <div className="flex flex-col items-end shrink-0 gap-0.5 pl-2">
                    <span className="text-[13px] font-extrabold text-white tracking-tight tabular-nums">
                      {formatCurrency(vehicle.price)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400 tracking-wide uppercase">
                      {vehicle.status || "Available"}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* 4. Unified Full Width Bottom Button Row */}
      <div className="mt-4 pt-1">
        <button
          type="button"
          className="w-full h-8 flex items-center justify-center rounded-md border border-slate-800/80 bg-card/40 text-[11px] font-bold text-blue-400 hover:bg-card/80 hover:text-blue-300 transition-colors"
        >
          View All Inventory
        </button>
      </div>
    </CardShell>
  );
}