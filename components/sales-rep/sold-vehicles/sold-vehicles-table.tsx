"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileText, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatCommissionCurrency, formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import {
  formatSoldDate,
  getVehicleLabel,
} from "@/lib/sales-rep/sold-vehicles/calculations";
import type { ISalesRepSoldVehicle } from "@/lib/sales-rep/sold-vehicles/types";
import { cn } from "@/lib/utils";
import SoldVehiclesStatusBadge from "./sold-vehicles-status-badge";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1100px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

type Props = {
  records: ISalesRepSoldVehicle[];
  loading?: boolean;
  onView: (record: ISalesRepSoldVehicle) => void;
};

function ActionMenu({
  record,
  onView,
}: {
  record: ISalesRepSoldVehicle;
  onView: (record: ISalesRepSoldVehicle) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleDownloadReport = () => {
    if (record.status !== "completed") {
      toast.error("Report is only available for completed sales.");
      setOpen(false);
      return;
    }
    toast.success(`Downloading report for ${getVehicleLabel(record)}...`);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onView(record);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-blue-400"
        aria-label="View details"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadReport();
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-emerald-400"
        aria-label="Download report"
      >
        <FileText className="h-3.5 w-3.5" />
      </button>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          aria-label="More actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-700 bg-card py-1 shadow-xl">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                onView(record);
                setOpen(false);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadReport();
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Download Report
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(record.stockNumber);
                toast.success("Stock number copied");
                setOpen(false);
              }}
            >
              Copy Stock #
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SoldVehiclesTable({ records, loading, onView }: Props) {
  const columns: Column<ISalesRepSoldVehicle>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => getVehicleLabel(row),
      cell: (row) => (
        <div className="flex min-w-[180px] items-center gap-2.5">
          <img
            src={row.vehicleImageUrl || PLACEHOLDER_IMG}
            alt={getVehicleLabel(row)}
            className="h-9 w-14 shrink-0 rounded-md object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="truncate font-semibold text-white">
              {getVehicleLabel(row)}
            </div>
            <div className="truncate text-[10px] text-slate-500">
              Stock # {row.stockNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      accessor: (row) => row.customerName,
      cell: (row) => (
        <div className="min-w-[120px]">
          <div className="text-[11px] font-medium text-white">
            {row.customerName}
          </div>
          <div className="text-[10px] text-slate-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "soldDate",
      header: "Sold Date",
      sortable: true,
      accessor: (row) => row.soldDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-300">
          {formatSoldDate(row.soldDate)}
        </span>
      ),
    },
    {
      key: "soldPrice",
      header: "Sold Price",
      sortable: true,
      accessor: (row) => row.soldPrice,
      cell: (row) => (
        <span className="tabular-nums font-medium text-white">
          {formatCommissionPrice(row.soldPrice)}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      accessor: (row) => row.cost,
      cell: (row) => (
        <span className="tabular-nums text-slate-400">
          {formatCommissionPrice(row.cost)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums font-semibold text-emerald-400">
          {formatCommissionPrice(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      sortable: true,
      accessor: (row) => row.commission,
      cell: (row) => (
        <span className="tabular-nums font-semibold text-emerald-400">
          {formatCommissionCurrency(row.commission)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <SoldVehiclesStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => <ActionMenu record={row} onView={onView} />,
    },
  ];

  return (
    <div className={cn(TABLE_WRAPPER_CLASS)}>
      <DataTable
        columns={columns}
        data={records}
        rowKey="id"
        addPagination
        pageSize={6}
        loading={loading}
        paginationSummaryLabel="vehicles"
        emptyMessage="No sold vehicles match your filters. Try adjusting your search or filters."
      />
    </div>
  );
}
