"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  totalVehicleCost,
} from "@/lib/dealer/dashboard/calculations";
import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import {
  getMissingTitleVehicles,
  getPendingSaleVehicles,
  getSoldThisMonthVehicles,
} from "@/lib/dealer/inventory/inventory-calculations";
import {
  INVENTORY_KPI_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/dealer/inventory/inventory-constants";
import type {
  InventoryKpiFilterKey,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";

function formatDisplayDate(iso?: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SummaryCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-md border border-[#1e293b] bg-[#070c14]/60 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-[16px] font-bold text-white tabular-nums">
        {value}
      </div>
      {subValue ? (
        <div className="mt-0.5 text-[10px] text-slate-500">{subValue}</div>
      ) : null}
    </div>
  );
}

export default function InventoryDetailSheet({
  open,
  onOpenChange,
  variant,
  vehicles,
  onViewVehicle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: Exclude<InventoryKpiFilterKey, "all"> | null;
  vehicles: WholesaleVehicle[];
  onViewVehicle?: (vehicle: WholesaleVehicle) => void;
}) {
  if (!variant) return null;

  const filtered =
    variant === "missing_titles"
      ? getMissingTitleVehicles(vehicles)
      : variant === "pending_sale"
        ? getPendingSaleVehicles(vehicles)
        : getSoldThisMonthVehicles(vehicles);

  const totalValue = filtered.reduce(
    (sum, v) => sum + totalVehicleCost(v.costs),
    0,
  );
  const onHoldPayments = filtered
    .filter((v) => v.paymentStatus === "on_hold")
    .reduce((sum, v) => sum + (v.soldPrice ?? 0), 0);
  const avgDaysTitlePending =
    filtered.length > 0
      ? Math.round(
          filtered.reduce(
            (sum, v) => sum + (v.daysSinceTitlePending ?? 0),
            0,
          ) / filtered.length,
        )
      : 0;
  const avgDaysInInventory =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((sum, v) => sum + v.daysInLot, 0) / filtered.length,
        )
      : 0;
  const title = `${INVENTORY_KPI_LABELS[variant]} Details`;

  const howItWorks =
    variant === "missing_titles"
      ? "Vehicles with missing titles remain tracked here. Once the title is received and verified, payment can be released and the vehicle moves out of this list."
      : variant === "pending_sale"
        ? "Vehicles that did not sell are marked Pending Sale and scheduled for re-run. Update auction dates manually until auction integration is available."
        : "Vehicles sold in the current month appear here with sale price and profit totals.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-[#1e293b] bg-[#0a101d] text-white sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-[13px] font-bold tracking-wide text-white">
            {title.toUpperCase()}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryCard label="Total Vehicles" value={String(filtered.length)} />
          <SummaryCard label="Total Value" value={formatCurrency(totalValue)} />
          {variant === "missing_titles" && (
            <>
              <SummaryCard
                label="Avg Days Title Pending"
                value={String(avgDaysTitlePending)}
              />
              <SummaryCard
                label="On Hold Payments"
                value={formatCurrency(onHoldPayments)}
              />
            </>
          )}
          {variant === "pending_sale" && (
            <SummaryCard
              label="Avg Days in Inventory"
              value={String(avgDaysInInventory)}
            />
          )}
          {variant === "sold_this_month" && (
            <SummaryCard
              label="Sold This Month"
              value={String(filtered.length)}
            />
          )}
        </div>

        <div className="mt-4 space-y-2">
          {filtered.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center gap-2 rounded-md border border-[#1e293b] bg-[#070c14]/40 p-2"
            >
              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-800">
                {vehicle.imageUrl ? (
                  <Image
                    src={vehicle.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-semibold text-white">
                  {vehicle.stockNumber}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {getVehicleLabel(vehicle)}
                </div>
                {variant === "pending_sale" && (
                  <div className="mt-0.5 text-[10px] text-violet-400">
                    Auctions: {vehicle.timesInAuction ?? 0}
                    {vehicle.nextAuctionDate
                      ? ` ' Next: ${formatDisplayDate(vehicle.nextAuctionDate)}`
                      : ""}
                  </div>
                )}
                {variant === "missing_titles" && (
                  <div className="mt-0.5 text-[10px] text-amber-400">
                    {vehicle.daysSinceTitlePending ?? 0} days '{" "}
                    {vehicle.paymentStatus
                      ? PAYMENT_STATUS_LABELS[vehicle.paymentStatus]
                      : "'"}
                  </div>
                )}
              </div>
              {onViewVehicle && (
                <button
                  type="button"
                  onClick={() => onViewVehicle(vehicle)}
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-[11px] text-slate-500 py-6">
              No vehicles in this category.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3">
          <div className="text-[11px] font-semibold text-white">How it works</div>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
            {howItWorks}
          </p>
          {variant === "missing_titles" && (
            <p className={cn("mt-2 text-[10px] text-amber-400/90")}>
              Note: Payment is typically released only after title verification.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
