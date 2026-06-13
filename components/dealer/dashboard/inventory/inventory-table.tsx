"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Eye, MoreHorizontal, Pencil } from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatCurrencyExact,
  totalVehicleCost,
} from "@/lib/dealer/dashboard/calculations";
import {
  CONDITION_LABELS,
  CONDITION_STYLES,
  INVENTORY_STATUS_LABELS,
} from "@/lib/dealer/inventory/inventory-constants";
import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type {
  WholesaleInventoryStatus,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import {
  InventoryStatusBadges,
  PaymentStatusBadge,
} from "./inventory-status-badges";

function formatMileage(value?: number): string {
  if (value == null || value === 0) return "'";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDisplayDate(iso?: string): string {
  if (!iso) return "'";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InventoryTable({
  vehicles,
  loading,
  onEdit,
  onChangeTitleStatus,
  onChangeInventoryStatus,
}: {
  vehicles: WholesaleVehicle[];
  loading?: boolean;
  onEdit: (vehicle: WholesaleVehicle) => void;
  onChangeTitleStatus: (vehicle: WholesaleVehicle) => void;
  onChangeInventoryStatus: (
    vehicle: WholesaleVehicle,
    status: WholesaleInventoryStatus,
  ) => void;
}) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const columns: Column<WholesaleVehicle>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => getVehicleLabel(row),
      cell: (row) => (
        <Link
          href={`/dealer/inventory/${row.id}`}
          className="flex w-full items-center gap-2.5 text-left transition hover:opacity-80"
        >
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={getVehicleLabel(row)}
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
              {getVehicleLabel(row)}
            </div>
            {row.trim ? (
              <div className="truncate text-[10px] text-slate-500">{row.trim}</div>
            ) : null}
          </div>
        </Link>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (row) => <span className="text-slate-300">{row.stockNumber}</span>,
    },
    {
      key: "vin",
      header: "VIN",
      sortable: true,
      cell: (row) => (
        <span
          className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[13px] text-slate-400 hover:text-slate-200"
          onClick={() => {
            navigator.clipboard.writeText(row.vin);
            toast.success("VIN copied");
          }}
          title="Click to copy VIN"
        >
          {row.vin}
          <Copy className="h-3 w-3 text-slate-500" />
        </span>
      ),
    },
    {
      key: "mileage",
      header: "Mileage",
      sortable: true,
      accessor: (row) => row.mileage ?? 0,
      cell: (row) => (
        <span className="text-slate-300">{formatMileage(row.mileage)}</span>
      ),
    },
    {
      key: "condition",
      header: "Condition",
      cell: (row) =>
        row.condition ? (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold",
              CONDITION_STYLES[row.condition],
            )}
          >
            {CONDITION_LABELS[row.condition]}
          </span>
        ) : (
          <span className="text-slate-500">'</span>
        ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-400">{row.location || "'"}</span>
      ),
    },
    {
      key: "purchaseDate",
      header: "Date Acquired",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-300">{formatDisplayDate(row.purchaseDate)}</span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      accessor: (row) => totalVehicleCost(row.costs),
      cell: (row) => (
        <span className="text-slate-400">
          {formatCurrencyExact(totalVehicleCost(row.costs))}
        </span>
      ),
    },
    {
      key: "wholesaleValue",
      header: "Wholesale Value",
      sortable: true,
      accessor: (row) => row.wholesaleValue,
      cell: (row) => (
        <span className="font-medium text-white">
          {formatCurrency(row.wholesaleValue)}
        </span>
      ),
    },
    {
      key: "soldPrice",
      header: "Sold Price",
      sortable: true,
      accessor: (row) => row.soldPrice ?? 0,
      cell: (row) => (
        <span className="text-slate-300">
          {row.soldPrice != null ? formatCurrency(row.soldPrice) : "'"}
        </span>
      ),
    },
    {
      key: "profit",
      header: "Profit",
      sortable: true,
      accessor: (row) => row.profit ?? 0,
      cell: (row) => {
        const profit = row.profit ?? 0;
        return (
          <span
            className={cn(
              "font-semibold",
              profit >= 0 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {formatCurrency(profit)}
          </span>
        );
      },
    },
    {
      key: "daysInLot",
      header: "Days in Inventory",
      sortable: true,
      accessor: (row) => row.daysInLot,
      cell: (row) => (
        <span className="font-medium text-slate-300">{row.daysInLot}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => <InventoryStatusBadges vehicle={row} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      cell: (row) =>
        row.paymentStatus ? (
          <PaymentStatusBadge status={row.paymentStatus} />
        ) : (
          <span className="text-slate-500">'</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              onEdit(row);
              setActivePopover(null);
            }}
            className="grid h-8 w-8 place-items-center rounded-md border border-blue-500/50 bg-card text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            aria-label="Edit vehicle"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActivePopover(activePopover === row.id ? null : row.id)
              }
              className="grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-card text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {activePopover === row.id && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
              >
                <Link
                  href={`/dealer/inventory/${row.id}`}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                  onClick={() => setActivePopover(null)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-xs text-slate-300 transition hover:bg-slate-800"
                  onClick={() => {
                    setActivePopover(null);
                    onChangeTitleStatus(row);
                  }}
                >
                  Change Title Status
                </button>
                {row.titleStatus === "missing" && (
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs text-emerald-400 transition hover:bg-slate-800"
                    onClick={() => {
                      setActivePopover(null);
                      onChangeTitleStatus(row);
                    }}
                  >
                    Mark Title Received
                  </button>
                )}
                <div className="my-1 border-t border-slate-700" />
                <div className="px-3 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Inventory Status
                </div>
                {(
                  Object.keys(INVENTORY_STATUS_LABELS) as WholesaleInventoryStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-800",
                      row.inventoryStatus === status
                        ? "text-violet-400"
                        : "text-slate-300",
                    )}
                    onClick={() => {
                      setActivePopover(null);
                      onChangeInventoryStatus(row, status);
                    }}
                  >
                    {INVENTORY_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={vehicles}
      rowKey="id"
      loading={loading}
      pageSize={10}
      addPagination
      emptyMessage="No vehicles match your filters."
      paginationSummaryLabel="vehicles"
    />
  );
}
