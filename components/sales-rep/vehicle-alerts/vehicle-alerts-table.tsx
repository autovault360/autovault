"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, FileText, MoreVertical, Pencil, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import {
  formatAlertDate,
  getRelativeTime,
  getVehicleLabel,
} from "@/lib/sales-rep/vehicle-alerts/calculations";
import type { ISalesRepVehicleAlert } from "@/lib/sales-rep/vehicle-alerts/types";
import { cn } from "@/lib/utils";
import VehicleAlertsStatusBadge from "./vehicle-alerts-status-badge";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1200px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type ActionMenuProps = {
  record: ISalesRepVehicleAlert;
  onView: (record: ISalesRepVehicleAlert) => void;
  onResolve: (record: ISalesRepVehicleAlert) => void;
  onEdit: (record: ISalesRepVehicleAlert) => void;
  onDelete: (record: ISalesRepVehicleAlert) => void;
};

function ActionMenu({
  record,
  onView,
  onResolve,
  onEdit,
  onDelete,
}: ActionMenuProps) {
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

  const handleDownload = () => {
    if (record.status === "needs_changes") {
      toast.error("Please resolve requested changes before downloading.");
      setOpen(false);
      return;
    }
    toast.success(`Downloading deal jacket ${record.dealJacketId}...`);
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
        aria-label="View alert"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-emerald-400"
        aria-label="Download documents"
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
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-700 bg-card py-1 shadow-xl">
            <MenuItem
              icon={Eye}
              label="View Alert"
              onClick={() => {
                onView(record);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={CheckCircle}
              label="Mark as Resolved"
              onClick={() => {
                onResolve(record);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={Pencil}
              label="Edit Alert"
              onClick={() => {
                onEdit(record);
                setOpen(false);
              }}
            />
            <MenuItem
              icon={Trash2}
              label="Delete Alert"
              destructive
              onClick={() => {
                onDelete(record);
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] hover:bg-slate-800",
        destructive ? "text-red-400" : "text-slate-300",
      )}
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

type Props = {
  records: ISalesRepVehicleAlert[];
  loading?: boolean;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onView: (record: ISalesRepVehicleAlert) => void;
  onResolve: (record: ISalesRepVehicleAlert) => void;
  onEdit: (record: ISalesRepVehicleAlert) => void;
  onDelete: (record: ISalesRepVehicleAlert) => void;
};

export default function VehicleAlertsTable({
  records,
  loading,
  pageSize,
  onPageSizeChange,
  onView,
  onResolve,
  onEdit,
  onDelete,
}: Props) {
  const columns: Column<ISalesRepVehicleAlert>[] = [
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
          {formatAlertDate(row.soldDate)}
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
      key: "dealJacketId",
      header: "Deal Jacket",
      sortable: true,
      cell: (row) => (
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          className="font-mono text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          {row.dealJacketId}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <VehicleAlertsStatusBadge status={row.status} />,
    },
    {
      key: "pendingSince",
      header: "Pending Since",
      sortable: true,
      accessor: (row) => row.pendingSince,
      cell: (row) => (
        <div className="min-w-[120px]">
          <div className="text-[11px] text-slate-300">
            {formatAlertDate(row.pendingSince)}
          </div>
          <div className="text-[10px] text-slate-500">
            {getRelativeTime(row.pendingSince)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <ActionMenu
          record={row}
          onView={onView}
          onResolve={onResolve}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <div className={cn(TABLE_WRAPPER_CLASS)}>
      <DataTable
        columns={columns}
        data={records}
        rowKey="id"
        addPagination
        pageSize={pageSize}
        loading={loading}
        paginationSummaryLabel="vehicles"
        emptyMessage="No vehicle alerts match your filters. Try adjusting your search or filters."
      />
      {!loading && records.length > 0 && (
        <div className="mt-2 flex justify-end border-t border-slate-800/80 px-3 pt-3">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger theme="dark" className="h-8 w-[72px] text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent theme="dark">
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-500">
                    Per page
                  </SelectLabel>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      theme="dark"
                      className="text-[11px]"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
