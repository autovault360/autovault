"use client";

import Image from "next/image";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatCurrencyExact,
  totalVehicleCost,
} from "@/lib/dealer/dashboard/calculations";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import { InventoryStatusBadge } from "./inventory/inventory-status-badges";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

function StatusBadge({ vehicle }: { vehicle: WholesaleVehicle }) {
  return <InventoryStatusBadge status={vehicle.inventoryStatus} />;
}

const DEFAULT_SHELL_CLASS =
  "min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm";

export default function InventoryMiniPanel({
  vehicles,
  loading,
  onViewAll,
  shellClassName,
}: {
  vehicles: WholesaleVehicle[];
  loading?: boolean;
  onViewAll?: () => void;
  shellClassName?: string;
}) {
  const topFive = vehicles.slice(0, 5);
  const shellClass = cn(DEFAULT_SHELL_CLASS, shellClassName);

  if (loading) {
    return (
      <CardShell className={shellClass}>
        <SkeletonBar className="mb-3 h-3 w-36" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <SkeletonBar className="h-8 w-10 rounded" />
            <SkeletonBar className="h-8 flex-1" />
            <SkeletonBar className="h-5 w-16" />
          </div>
        ))}
      </CardShell>
    );
  }

  return (
    <CardShell className={shellClass}>
      <CardHead title="INVENTORY OVERVIEW" />
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[#1e293b] text-left text-[10px] font-bold tracking-wide text-[#64748b]">
              <th className="pb-2 pr-2">Vehicle</th>
              <th className="pb-2 pr-2">Stock #</th>
              <th className="pb-2 pr-2">Cost</th>
              <th className="pb-2 pr-2">Days</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {topFive.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[#1e293b]/60 last:border-0"
              >
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded bg-slate-800">
                      {v.imageUrl ? (
                        <Image
                          src={v.imageUrl}
                          alt={`${v.year} ${v.make}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <span className="truncate text-white">
                      {v.year} {v.make} {v.model}
                    </span>
                  </div>
                </td>
                <td className="py-2 pr-2 tabular-nums text-slate-300">
                  {v.stockNumber}
                </td>
                <td className="py-2 pr-2 tabular-nums text-slate-300">
                  {formatCurrencyExact(totalVehicleCost(v.costs))}
                </td>
                <td className="py-2 pr-2 tabular-nums text-slate-300">
                  {v.daysInLot}
                </td>
                <td className="py-2">
                  <StatusBadge vehicle={v} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-2 text-[11px] text-blue-400 hover:underline"
        >
          View full inventory
        </button>
      )}
    </CardShell>
  );
}

export { InventoryStatusBadge as StatusBadge } from "./inventory/inventory-status-badges";
