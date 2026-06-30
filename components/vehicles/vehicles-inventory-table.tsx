"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Eye,
  Shuffle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  getVehicleName,
} from "@/lib/vehicles/types";
import {
  computeTableTotals,
  getDisplayStatus,
  getDisplayStatusStyle,
  splitInventorySections,
  type InventoryTableTotals,
  type InventoryVehicle,
} from "@/lib/vehicles/inventory-calculations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLUMN_COUNT = 20;

function getPaginationRange(
  currentPage: number,
  pageCount: number,
): (number | "...")[] {
  const range: (number | "...")[] = [];
  const delta = 2;
  const left = Math.max(0, currentPage - delta);
  const right = Math.min(pageCount - 1, currentPage + delta);

  if (left > 0) {
    range.push(0);
    if (left > 1) range.push("...");
  }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < pageCount - 1) {
    if (right < pageCount - 2) range.push("...");
    range.push(pageCount - 1);
  }
  return range;
}

function formatShortDate(date: string | undefined): string {
  if (!date) return "?";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return formatDate(date);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function TotalsRow({ totals }: { totals: InventoryTableTotals }) {
  return (
    <tr className="border-b border-slate-700/80 bg-slate-900/60">
      <td className="px-3 py-2.5 font-semibold text-white">Totals</td>
      <td colSpan={2} />
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.purchasePrice)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.fees)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.repairs)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-red-400 tabular-nums">
        {formatCurrency(totals.flooringCost)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.salesTax)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.regFees)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-sky-400 tabular-nums">
        {formatCurrency(totals.totalInvestment)}
      </td>
      <td />
      <td className="px-3 py-2.5 font-semibold text-slate-300 tabular-nums">
        {formatCurrency(totals.totalVehicleCost)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-red-400 tabular-nums">
        {formatCurrency(totals.commission)}
      </td>
      <td className="px-3 py-2.5 font-semibold text-amber-400 tabular-nums">
        {formatCurrency(totals.netProfit)}
      </td>
      <td />
      <td colSpan={5} />
    </tr>
  );
}

function SectionHeader({
  label,
  variant,
}: {
  label: string;
  variant: "sold" | "active";
}) {
  return (
    <tr
      className={cn(
        "border-b border-slate-800/80",
        variant === "sold"
          ? "bg-emerald-950/50"
          : "bg-blue-950/40",
      )}
    >
      <td
        colSpan={COLUMN_COUNT}
        className={cn(
          "px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em]",
          variant === "sold" ? "text-emerald-400" : "text-blue-400",
        )}
      >
        {label}
      </td>
    </tr>
  );
}

function SectionSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <tr className="border-b border-emerald-900/30 bg-emerald-950/20">
      <td colSpan={COLUMN_COUNT} className="px-3 py-2 text-right">
        <span className="text-[11.5px] font-semibold text-emerald-400">
          {label}:{" "}
          <span className="tabular-nums">{value}</span>
        </span>
      </td>
    </tr>
  );
}

type VehiclesInventoryTableProps = {
  vehicles: InventoryVehicle[];
  onEdit: (id: string) => void;
  onChangeStatus: (id: string) => void;
};

export default function VehiclesInventoryTable({
  vehicles,
  onEdit,
  onChangeStatus,
}: VehiclesInventoryTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPageIndex(0);
  }, [vehicles]);

  useEffect(() => {
    if (!activePopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePopover]);

  const { soldThisMonth, activeInventory } = useMemo(
    () => splitInventorySections(vehicles),
    [vehicles],
  );

  const totals = useMemo(() => computeTableTotals(vehicles), [vehicles]);
  const soldProfit = useMemo(
    () => soldThisMonth.reduce((sum, v) => sum + v.netProfit, 0),
    [soldThisMonth],
  );

  type RowEntry =
    | { type: "section"; key: string; label: string; variant: "sold" | "active" }
    | { type: "summary"; key: string; label: string; value: string }
    | { type: "vehicle"; key: string; vehicle: InventoryVehicle; tint?: "sold" };

  const allRows = useMemo(() => {
    const rows: RowEntry[] = [];
    if (soldThisMonth.length > 0) {
      rows.push({
        type: "section",
        key: "sold-header",
        label: `Sold This Month (${soldThisMonth.length})`,
        variant: "sold",
      });
      for (const vehicle of soldThisMonth) {
        rows.push({ type: "vehicle", key: vehicle.id, vehicle, tint: "sold" });
      }
      rows.push({
        type: "summary",
        key: "sold-summary",
        label: "Sold Profit This Month",
        value: formatCurrency(soldProfit),
      });
    }
    if (activeInventory.length > 0) {
      rows.push({
        type: "section",
        key: "active-header",
        label: `Active Inventory (${activeInventory.length} Vehicles)`,
        variant: "active",
      });
      for (const vehicle of activeInventory) {
        rows.push({ type: "vehicle", key: vehicle.id, vehicle });
      }
    }
    return rows;
  }, [soldThisMonth, activeInventory, soldProfit]);

  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = allRows.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize,
  );

  const vehicleCount = vehicles.length;
  const firstVehicleOnPage = pageRows.find((r) => r.type === "vehicle");
  const lastVehicleOnPage = [...pageRows].reverse().find((r) => r.type === "vehicle");

  let showingFrom = 0;
  let showingTo = 0;
  if (vehicleCount > 0 && firstVehicleOnPage?.type === "vehicle") {
    const firstIdx = vehicles.findIndex((v) => v.id === firstVehicleOnPage.vehicle.id);
    const lastIdx =
      lastVehicleOnPage?.type === "vehicle"
        ? vehicles.findIndex((v) => v.id === lastVehicleOnPage.vehicle.id)
        : firstIdx;
    showingFrom = firstIdx + 1;
    showingTo = lastIdx + 1;
  }

  function renderVehicleRow(vehicle: InventoryVehicle, tint?: "sold") {
    const displayStatus = getDisplayStatus(vehicle);
    const received = vehicle.titleReceived ?? false;

    return (
      <tr
        key={vehicle.id}
        className={cn(
          "border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/20",
          tint === "sold" && "bg-emerald-950/15",
        )}
      >
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-300">
          {formatShortDate(vehicle.arrivalDate)}
        </td>
        <td className="px-3 py-2.5 min-w-[200px]">
          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="flex items-center gap-2.5 transition hover:opacity-80"
          >
            {vehicle.image ? (
              <img
                src={vehicle.image}
                alt={getVehicleName(vehicle)}
                className="h-9 w-14 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[9px] text-slate-500">
                No Photo
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">
                {getVehicleName(vehicle)}
              </div>
              <div className="truncate text-[10px] text-slate-500">
                Stock #{vehicle.stockNumber || "?"}
              </div>
            </div>
          </Link>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[12px] text-slate-400 hover:text-slate-200"
            onClick={() => {
              navigator.clipboard.writeText(vehicle.vin);
              toast.success("VIN copied");
            }}
            title="Click to copy VIN"
          >
            {vehicle.vin}
            <Copy className="h-3 w-3 text-slate-500" />
          </span>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-300 tabular-nums">
          {formatCurrency(vehicle.purchasePrice ?? vehicle.cost)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-400 tabular-nums">
          {formatCurrency(vehicle.auctionFees)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-400 tabular-nums">
          {formatCurrency(vehicle.repairs)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-red-400 tabular-nums">
          {formatCurrency(vehicle.flooringCost)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-400 tabular-nums">
          {vehicle.salesTax > 0 ? formatCurrency(vehicle.salesTax) : "?"}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-400 tabular-nums">
          {formatCurrency(vehicle.registrationFees ?? 0)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-sky-400 tabular-nums">
          {formatCurrency(vehicle.totalInvestment)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-300 tabular-nums">
          {vehicle.flooringAgeDays > 0 ? vehicle.flooringAgeDays : "?"}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-300 tabular-nums">
          {formatCurrency(vehicle.totalVehicleCost)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-red-400 tabular-nums">
          {vehicle.commissionAmount > 0 ? (
            <>
              {formatCurrency(vehicle.commissionAmount)}
              {vehicle.commissionRate > 0 && (
                <span className="ml-1 text-[10px] text-red-400/80">
                  / {vehicle.commissionRate.toFixed(1)}%
                </span>
              )}
            </>
          ) : (
            "?"
          )}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-amber-400 tabular-nums">
          {vehicle.netProfit !== 0 ? formatCurrency(vehicle.netProfit) : "?"}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-amber-400 tabular-nums">
          {vehicle.roiPercent > 0 ? `${vehicle.roiPercent.toFixed(1)}%` : "?"}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          {vehicle.salesRepName ? (
            <div className="flex items-center gap-2">
              {vehicle.salesRepImage ? (
                <img
                  src={vehicle.salesRepImage}
                  alt={vehicle.salesRepName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-slate-700 text-[9px] font-semibold text-slate-300">
                  {vehicle.salesRepName.charAt(0)}
                </div>
              )}
              <span className="text-[11.5px] text-slate-300">{vehicle.salesRepName}</span>
            </div>
          ) : (
            <span className="text-slate-500">?</span>
          )}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap text-slate-300 tabular-nums">
          {vehicle.daysInInventory}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
              getDisplayStatusStyle(displayStatus),
            )}
          >
            {displayStatus}
          </span>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            {received ? (
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            )}
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                received ? "text-emerald-400" : "text-red-400",
              )}
            >
              {received ? "Title In" : "Missing"}
            </span>
          </span>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <div className="flex items-center justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActivePopover(activePopover === vehicle.id ? null : vehicle.id)
                }
                className="grid h-7 w-7 place-items-center rounded-md border border-slate-700 bg-card text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {activePopover === vehicle.id && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
                >
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}`}
                    onClick={() => setActivePopover(null)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onEdit(vehicle.id);
                      setActivePopover(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeStatus(vehicle.id);
                      setActivePopover(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    Change Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-sm border border-slate-800 bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-[1800px] w-full text-[11.5px]">
          <thead className="bg-background/5 text-[11px] tracking-[0.06em] text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Purchase Date</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Vehicle</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">VIN</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Purchase Price</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Fees</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Repairs</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Flooring Cost</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Sales Tax</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Reg. Fees</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Total Investment</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Flooring Age (Days)</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Total Vehicle Cost</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Commission</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Net Vehicle Profit</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">ROI</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Sales Rep</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Days in Inventory</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Status</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Title</th>
              <th className="px-3 py-3 text-right font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 && <TotalsRow totals={totals} />}
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-3 py-12 text-center text-[12px] text-slate-400"
                >
                  No vehicles match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                if (row.type === "section") {
                  return (
                    <SectionHeader
                      key={row.key}
                      label={row.label}
                      variant={row.variant}
                    />
                  );
                }
                if (row.type === "summary") {
                  return (
                    <SectionSummary
                      key={row.key}
                      label={row.label}
                      value={row.value}
                    />
                  );
                }
                return renderVehicleRow(row.vehicle, row.tint);
              })
            )}
          </tbody>
        </table>
      </div>

      {vehicles.length > 0 && (
        <div className="flex w-full flex-col gap-4 border-t border-slate-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-slate-500">
            {showingFrom > 0
              ? `Showing ${showingFrom} to ${showingTo} of ${vehicleCount} vehicles`
              : `Showing ${vehicleCount} vehicle${vehicleCount === 1 ? "" : "s"}`}
          </span>

          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger theme="dark" className="h-8 w-[88px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent theme="dark">
                  {[6, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)} theme="dark">
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pageCount > 1 && (
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPageIndex((p) => Math.max(0, p - 1));
                      }}
                      className={cn(
                        safePageIndex === 0 && "pointer-events-none opacity-50",
                        "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                      )}
                    />
                  </PaginationItem>
                  {getPaginationRange(safePageIndex, pageCount).map((item, index) =>
                    item === "..." ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === safePageIndex}
                          className={cn(
                            "h-8 w-8 rounded-md border text-sm font-medium",
                            item === safePageIndex
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            setPageIndex(item);
                          }}
                        >
                          {item + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPageIndex((p) => Math.min(pageCount - 1, p + 1));
                      }}
                      className={cn(
                        safePageIndex >= pageCount - 1 &&
                          "pointer-events-none opacity-50",
                        "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
