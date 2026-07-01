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
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import FlooringDetailModal from "@/components/vehicles/flooring/flooring-detail-modal";
import RegistrationFeesNotice from "@/components/vehicles/registration-fees-notice";
import AddOnModal from "@/components/vehicles/add-on-modal";
import type { AddOnItem } from "@/components/vehicles/add-on-modal";
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
    <tr className="bg-slate-900/60">
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
    <tr className="bg-emerald-950/20">
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
  onSaveField: (
    vehicleId: string,
    field:
      | "acquisition_cost"
      | "auction_fees"
      | "reconditioning_cost"
      | "flooring_fees"
      | "registration_fees",
    value: number,
  ) => Promise<void>;
  columnColorMap: Record<string, string>;
  gridLines?: boolean;
};

export default function VehiclesInventoryTable({
  vehicles,
  onEdit,
  onChangeStatus,
  onSaveField,
  columnColorMap,
  gridLines = false,
}: VehiclesInventoryTableProps) {
  useEffect(() => {
    const styleId = "grid-lines-style";
    const existing = document.getElementById(styleId) as HTMLStyleElement | null;
    if (gridLines) {
      if (!existing) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = ".show-grid tbody td { border-bottom: 1px solid rgba(255,255,255,0.05) !important; } .show-grid tbody tr { border-bottom: none !important; }";
        document.head.appendChild(style);
      }
    } else if (existing) {
      existing.remove();
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [gridLines]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    vehicleId: string;
    field:
      | "acquisition_cost"
      | "auction_fees"
      | "reconditioning_cost"
      | "registration_fees";
    value: string;
  } | null>(null);
  const [flooringDetailVehicle, setFlooringDetailVehicle] = useState<{
    id: string;
    year: number;
    make: string;
    model: string;
    purchasePrice: number;
    acquisitionDate: string;
    flooringCost: number;
  } | null>(null);
  const [regFeesNoticeOpen, setRegFeesNoticeOpen] = useState(false);
  const [addOnModalState, setAddOnModalState] = useState<{
    vehicleId: string;
    vehicleName: string;
    items: AddOnItem[];
  } | null>(null);
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

  const orderedVehicles = useMemo(
    () => [...soldThisMonth, ...activeInventory],
    [soldThisMonth, activeInventory],
  );

  type RowEntry =
    | { type: "section"; key: string; label: string; variant: "sold" | "active" }
    | { type: "summary"; key: string; label: string; value: string }
    | { type: "vehicle"; key: string; vehicle: InventoryVehicle; tint?: "sold" };

  const vehicleCount = orderedVehicles.length;
  const pageCount = Math.max(1, Math.ceil(vehicleCount / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageStart = safePageIndex * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, vehicleCount);
  const paginatedVehicles = orderedVehicles.slice(pageStart, pageEnd);

  const pageRows = useMemo(() => {
    const rows: RowEntry[] = [];
    const soldIds = new Set(soldThisMonth.map((vehicle) => vehicle.id));
    let soldHeaderAdded = false;
    let activeHeaderAdded = false;
    let lastSoldGlobalIndex = -1;

    paginatedVehicles.forEach((vehicle, index) => {
      const globalIndex = pageStart + index;
      const isSold = soldIds.has(vehicle.id);

      if (isSold) {
        if (!soldHeaderAdded) {
          rows.push({
            type: "section",
            key: "sold-header",
            label: `Sold This Month (${soldThisMonth.length})`,
            variant: "sold",
          });
          soldHeaderAdded = true;
        }
        rows.push({ type: "vehicle", key: vehicle.id, vehicle, tint: "sold" });
        lastSoldGlobalIndex = globalIndex;
      } else {
        if (!activeHeaderAdded) {
          rows.push({
            type: "section",
            key: "active-header",
            label: `Active Inventory (${activeInventory.length} Vehicles)`,
            variant: "active",
          });
          activeHeaderAdded = true;
        }
        rows.push({ type: "vehicle", key: vehicle.id, vehicle });
      }
    });

    if (
      soldThisMonth.length > 0 &&
      lastSoldGlobalIndex >= 0 &&
      lastSoldGlobalIndex === soldThisMonth.length - 1
    ) {
      rows.push({
        type: "summary",
        key: "sold-summary",
        label: "Sold Profit This Month",
        value: formatCurrency(soldProfit),
      });
    }

    return rows;
  }, [
    paginatedVehicles,
    pageStart,
    soldThisMonth,
    activeInventory,
    soldProfit,
  ]);

  const showingFrom = vehicleCount > 0 ? pageStart + 1 : 0;
  const showingTo = pageEnd;

  function renderVehicleRow(vehicle: InventoryVehicle, tint?: "sold") {
    const displayStatus = getDisplayStatus(vehicle);
    const received = vehicle.titleReceived ?? false;

    const textStyle = (columnKey: string) =>
      columnColorMap[columnKey] ? { color: columnColorMap[columnKey] } : undefined;

    const renderEditable = (
      field: "acquisition_cost" | "auction_fees" | "reconditioning_cost" | "registration_fees",
      columnKey: string,
      value: number,
    ) => {
      const isEditing =
        editingCell?.vehicleId === vehicle.id && editingCell?.field === field;
      if (!isEditing) {
        return (
          <button
            type="button"
            className="cursor-pointer border-b border-dashed border-slate-600/60 text-left transition hover:border-slate-400"
            style={textStyle(columnKey)}
            onClick={() =>
              setEditingCell({
                vehicleId: vehicle.id,
                field,
                value: String(value ?? 0),
              })
            }
          >
            {formatCurrency(value)}
          </button>
        );
      }

      return (
        <input
          autoFocus
          value={editingCell.value}
          onChange={(event) =>
            setEditingCell((current) =>
              current
                ? {
                    ...current,
                    value: event.currentTarget.value,
                  }
                : current,
            )
          }
          onKeyDown={async (event) => {
            if (event.key === "Escape") {
              setEditingCell(null);
              return;
            }
            if (event.key === "Enter") {
              const next = Number(editingCell.value);
              if (Number.isFinite(next) && next >= 0) {
                await onSaveField(vehicle.id, field, next);
              }
              setEditingCell(null);
            }
          }}
          onBlur={async () => {
            const next = Number(editingCell.value);
            if (Number.isFinite(next) && next >= 0) {
              await onSaveField(vehicle.id, field, next);
            }
            setEditingCell(null);
          }}
          className="h-7 w-[110px] rounded border border-slate-600 bg-slate-900 px-2 text-[11px] text-white outline-none"
        />
      );
    };

    return (
      <tr
        key={vehicle.id}
        className={cn(
          "transition hover:bg-slate-800/20",
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
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
          {renderEditable(
            "acquisition_cost",
            "purchase_price",
            vehicle.purchasePrice ?? vehicle.cost,
          )}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
          {renderEditable("auction_fees", "fees", vehicle.auctionFees)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
          {renderEditable("reconditioning_cost", "repairs", vehicle.repairs)}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
          <button
            type="button"
            onClick={() =>
              setFlooringDetailVehicle({
                id: vehicle.id,
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                purchasePrice: vehicle.purchasePrice ?? vehicle.cost,
                acquisitionDate: vehicle.arrivalDate ?? "",
                flooringCost: vehicle.flooringCost,
              })
            }
            className="border-b border-dashed border-red-400/70 text-red-400 transition hover:text-red-300"
            style={textStyle("flooring_cost")}
          >
            {vehicle.flooringCost > 0 ? formatCurrency(vehicle.flooringCost) : <span className="text-[11px] text-slate-500">Set flooring</span>}
          </button>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={textStyle("sales_tax")}>
          {vehicle.salesTax > 0 ? formatCurrency(vehicle.salesTax) : "?"}
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
          <span onClick={() => setRegFeesNoticeOpen(true)}>
            {renderEditable(
              "registration_fees",
              "reg_fees",
              vehicle.registrationFees ?? 0,
            )}
          </span>
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
        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={textStyle("commission")}>
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
        <td
          className="px-3 py-2.5 whitespace-nowrap font-medium tabular-nums"
          style={textStyle("net_vehicle_profit")}
        >
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
                className="grid h-7 w-7 place-items-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-800/80 hover:text-slate-200"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {activePopover === vehicle.id && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-slate-700 bg-[#0e1624] py-1 shadow-xl"
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
                      setAddOnModalState({
                        vehicleId: vehicle.id,
                        vehicleName: getVehicleName(vehicle),
                        items: vehicle.addOnItems ?? [],
                      });
                      setActivePopover(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                  >
                    <Circle className="h-3.5 w-3.5 text-blue-400" />
                    Add-Ons
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
    <div className="w-full overflow-hidden rounded-[14px] border border-slate-800/90 bg-[#101826]">
      <div className="overflow-x-auto">
        <table className={cn("min-w-[1800px] w-full text-[11.5px]", gridLines && "show-grid")}>
          <thead className="bg-slate-950/40 text-[10px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Purchase Date</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Vehicle</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">VIN</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.purchase_price ? { color: columnColorMap.purchase_price } : undefined}>Purchase Price</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.fees ? { color: columnColorMap.fees } : undefined}>Fees</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.repairs ? { color: columnColorMap.repairs } : undefined}>Repairs</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.flooring_cost ? { color: columnColorMap.flooring_cost } : undefined}>Flooring Cost</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.sales_tax ? { color: columnColorMap.sales_tax } : undefined}>Sales Tax</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.reg_fees ? { color: columnColorMap.reg_fees } : undefined}>Reg. Fees</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Total Investment</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Flooring Age (Days)</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Total Vehicle Cost</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.commission ? { color: columnColorMap.commission } : undefined}>Commission</th>
              <th className="px-3 py-3 text-left font-medium whitespace-nowrap" style={columnColorMap.net_vehicle_profit ? { color: columnColorMap.net_vehicle_profit } : undefined}>Net Vehicle Profit</th>
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
        <div className="flex w-full flex-col gap-3 border-t border-slate-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-slate-500">
            {showingFrom > 0
              ? `Showing ${showingFrom} to ${showingTo} of ${vehicleCount} vehicles`
              : `Showing ${vehicleCount} vehicle${vehicleCount === 1 ? "" : "s"}`}
          </span>

          <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <span className="whitespace-nowrap">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger theme="dark" className="h-8 w-[72px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent theme="dark" align="end">
                  {[6, 10, 20, 50].map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      theme="dark"
                      className="text-[12px]"
                    >
                      {size}
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
      <FlooringDetailModal
        open={!!flooringDetailVehicle}
        onOpenChange={(open) => { if (!open) setFlooringDetailVehicle(null); }}
        vehicle={flooringDetailVehicle}
        onSave={async (vehicleId, cost) => {
          await onSaveField(vehicleId, "flooring_fees", cost);
          setFlooringDetailVehicle(null);
        }}
      />
      <AddOnModal
        open={!!addOnModalState}
        onOpenChange={(open) => { if (!open) setAddOnModalState(null); }}
        vehicleName={addOnModalState?.vehicleName ?? ""}
        items={addOnModalState?.items ?? []}
        onSave={async (items, total) => {
          if (addOnModalState) {
            setAddOnModalState(null);
          }
        }}
      />
      <RegistrationFeesNotice
        open={regFeesNoticeOpen}
        onOpenChange={setRegFeesNoticeOpen}
      />
    </div>
  );
}
