"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import { formatSoldDate } from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";
import { cn } from "@/lib/utils";
import TransactionPaymentBadge from "../transactions/transaction-payment-badge";

const PAGE_SIZE_OPTIONS = [8, 10, 15, 20];

const TABLE_WRAPPER_CLASS =
  "[&>div]:min-w-0 [&>div]:max-w-full [&>div]:overflow-x-auto [&>div]:rounded-sm [&>div]:border-0 " +
  "[&_table]:min-w-[640px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:  [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800";

export default function SoldVehiclesTable({
  records,
  loading,
  activeRowKey,
  search,
  onSearchChange,
  onExport,
  onRowClick,
}: {
  records: SoldVehicleRecord[];
  loading?: boolean;
  activeRowKey?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
  onRowClick?: (record: SoldVehicleRecord) => void;
}) {
  const [pageSize, setPageSize] = useState(8);

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
        <div className="flex min-w-[180px] items-center gap-2.5">
          {row.vehicleImageUrl ? (
            <img
              src={row.vehicleImageUrl}
              alt=""
              className="h-9 w-11 shrink-0 rounded border border-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded border border-slate-800 bg-slate-800 text-[8px] text-slate-500">
              No Photo
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium text-slate-200">
              {row.vehicleLabel}
            </div>
            <div className="truncate text-[10px] text-slate-500">
              {row.exteriorColor ? `${row.exteriorColor} | ` : ""}
              {row.stockNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Buyer / Seller",
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
      header: "Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-emerald-400">
          {formatCurrencyExact(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Status",
      cell: (row) => <TransactionPaymentBadge status={row.paymentStatus} />,
    },
  ];

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-sm border p-3.5 shadow-none",
        ADMIN_PANEL_SHELL_CLASS,
      )}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[280px]">
          <InputGroup theme="dark">
            <InputGroupAddon theme="dark">
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by Make, Model, Stock #, or VIN..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              theme="dark"
              className="text-[11px]"
            />
          </InputGroup>
        </div>

        <Button
          type="button"
          variant="outline"
          theme="dark"
          size="sm"
          onClick={onExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      <div className={`min-w-0 max-w-full ${TABLE_WRAPPER_CLASS}`}>
        <DataTable
          columns={columns}
          data={records}
          rowKey="id"
          addPagination
          pageSize={pageSize}
          loading={loading}
          onRowClick={onRowClick}
          activeRowKey={activeRowKey}
          paginationSummaryLabel="sold vehicles"
          emptyMessage="No sold vehicles match your filters."
        />
      </div>

      {!loading && records.length > 0 && (
        <div className="mt-2 flex justify-end border-t border-slate-800/80 px-1 pt-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger theme="dark" className="h-7 w-[72px] text-[11px]">
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
            <span>/ page</span>
          </div>
        </div>
      )}
    </div>
  );
}
