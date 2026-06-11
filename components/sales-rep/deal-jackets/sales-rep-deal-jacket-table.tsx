"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Pencil } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import WorkflowStatusBadge from "@/components/deal-jackets/workflow-status-badge";
import {
  formatCurrency,
  formatDisplayDate,
  getVehicleDisplayName,
} from "@/lib/deal-jackets/types";
import type { DealJacketListItem } from "@/lib/deal-jackets/types";
import { cn } from "@/lib/utils";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1100px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

type Props = {
  records: DealJacketListItem[];
  loading?: boolean;
  showActions?: boolean;
  onView?: (record: DealJacketListItem) => void;
};

export default function SalesRepDealJacketTable({
  records,
  loading,
  showActions = false,
  onView,
}: Props) {
  const columns: Column<DealJacketListItem>[] = [
    {
      key: "vehicle",
      header: "Vehicle / Stock #",
      sortable: true,
      accessor: (row) => getVehicleDisplayName(row),
      cell: (row) => (
        <div className="flex min-w-[200px] items-center gap-2.5">
          <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-slate-700/80 bg-slate-800">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={getVehicleDisplayName(row)}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                <FolderOpen className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11.5px] font-semibold text-white">
              {getVehicleDisplayName(row)}
            </div>
            <div className="text-[11px] text-slate-500">
              Stock #{row.stockNumber}
            </div>
            <div className="truncate text-[9.5px] text-slate-600">{row.vin}</div>
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
        <div className="min-w-[130px]">
          <div className="text-[11px] font-medium text-white">
            {row.customerName}
          </div>
          <div className="text-[10px] text-slate-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "saleDate",
      header: "Sale Date",
      sortable: true,
      accessor: (row) => row.saleDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] text-slate-300">
          {formatDisplayDate(row.saleDate)}
        </span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] font-medium text-white">
          {formatCurrency(row.salePrice)}
        </span>
      ),
    },
    {
      key: "totalProfit",
      header: "Total Profit",
      sortable: true,
      accessor: (row) => row.totalProfit,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] font-semibold text-emerald-400">
          {formatCurrency(row.totalProfit)}
        </span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      sortable: true,
      accessor: (row) => row.commissionAmount,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] font-medium text-white">
          {formatCurrency(row.commissionAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.workflowStatus,
      cellClassName: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      cell: (row) => (
        <WorkflowStatusBadge
          status={row.workflowStatus}
          size="sm"
        />
      ),
    },
  ];

  if (showActions) {
    columns.push({
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      cell: (row) =>
        row.workflowStatus === "changes_requested" ? (
          <Link
            href={`/sales-rep/deal-jackets/edit/${row.id}`}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-amber-600/60 bg-amber-600 px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-amber-500"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
        ) : null,
    });
  }

  return (
    <div className={cn(TABLE_WRAPPER_CLASS)}>
      <DataTable
        columns={columns}
        data={records}
        rowKey="id"
        addPagination
        pageSize={10}
        loading={loading}
        paginationSummaryLabel="deal jackets"
        emptyMessage="No deal jackets match your filters. Try adjusting your search."
      />
    </div>
  );
}
