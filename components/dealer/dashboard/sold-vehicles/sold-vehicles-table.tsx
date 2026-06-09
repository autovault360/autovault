"use client";

import Image from "next/image";
import { Eye, FileText, MoreVertical } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import { formatSoldDate } from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import { PAYMENT_METHOD_LABELS } from "@/lib/dealer/dashboard/sold-vehicle-constants";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";
import TransactionPaymentBadge from "../transactions/transaction-payment-badge";

const TABLE_WRAPPER_CLASS =
  "[&>div]:min-w-0 [&>div]:max-w-full [&>div]:overflow-x-auto [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]: " +
  "[&_table]:min-w-[1300px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:  [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]: /60";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

export default function SoldVehiclesTable({
  records,
  loading,
  activeRowKey,
  onRowClick,
  onView,
}: {
  records: SoldVehicleRecord[];
  loading?: boolean;
  activeRowKey?: string | null;
  onRowClick?: (record: SoldVehicleRecord) => void;
  onView: (record: SoldVehicleRecord) => void;
}) {
  const columns: Column<SoldVehicleRecord>[] = [
    {
      key: "dateSold",
      header: "Date Sold",
      sortable: true,
      accessor: (row) => row.dateSold,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-400">
          {formatSoldDate(row.dateSold)}
        </span>
      ),
    },
    {
      key: "vehicleLabel",
      header: "Vehicle",
      cell: (row) => (
        <div className="flex min-w-[160px] items-center gap-2">
          <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded border border-slate-700/80 bg-slate-800">
            <Image
              src={row.vehicleImageUrl ?? PLACEHOLDER_IMG}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="truncate text-[11px] font-medium text-slate-200">
            {row.vehicleLabel}
          </span>
        </div>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-300">{row.stockNumber}</span>
      ),
    },
    {
      key: "vin",
      header: "VIN",
      cell: (row) => (
        <span className="max-w-[120px] truncate font-mono text-[10px] text-slate-500">
          {row.vin}
        </span>
      ),
    },
    {
      key: "buyer",
      header: "Buyer",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] font-medium text-white">{row.buyer}</span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-white">
          {formatCurrencyExact(row.salePrice)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-emerald-400">
          {formatCurrencyExact(row.grossProfit)}{" "}
          <span className="text-[10px] font-medium text-emerald-400/80">
            ({row.grossProfitPercent}%)
          </span>
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      cell: (row) => <TransactionPaymentBadge status={row.paymentStatus} />,
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {PAYMENT_METHOD_LABELS[row.paymentMethod]}
        </span>
      ),
    },
    {
      key: "dealNumber",
      header: "Deal #",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[10px] text-slate-400">{row.dealNumber}</span>
      ),
    },
    {
      key: "documents",
      header: "Documents",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-blue-400">
            <FileText className="h-3.5 w-3.5" />
            <span className="text-[10px]">{row.documents.length}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="rounded p-0.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="View sale"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="rounded p-0.5 text-slate-600 transition hover:bg-slate-800 hover:text-slate-400"
            aria-label="More actions"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`min-w-0 max-w-full py-1 ${TABLE_WRAPPER_CLASS}`}>
      <DataTable
        columns={columns}
        data={records}
        rowKey="id"
        addPagination
        pageSize={5}
        loading={loading}
        onRowClick={onRowClick}
        activeRowKey={activeRowKey}
        paginationSummaryLabel="sold vehicles"
        emptyMessage="No sold vehicles match your filters."
      />
    </div>
  );
}
