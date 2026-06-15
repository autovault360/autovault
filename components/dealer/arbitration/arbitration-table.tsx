"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, Download, Filter, Search, StickyNote } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import { filterArbitrationRecords } from "@/lib/dealer/arbitration/filter-arbitration";
import { downloadArbitrationCsv } from "@/lib/dealer/arbitration/export-arbitration";
import {
  formatDisplayDate,
  getArbitrationVehicleName,
  getArbitrationVehicleSubtitle,
  type ArbitrationRecord,
} from "@/lib/dealer/arbitration/types";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[1180px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-3.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-[#0a101c]/30";

type Props = {
  records: ArbitrationRecord[];
  dealers: string[];
  reasons: string[];
  isLoading?: boolean;
  onAddNote: (record: ArbitrationRecord) => void;
};

export default function ArbitrationTable({
  records,
  dealers,
  reasons,
  isLoading = false,
  onAddNote,
}: Props) {
  const [search, setSearch] = useState("");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(
    () =>
      filterArbitrationRecords(records, {
        search,
        dealer: dealerFilter,
        reason: reasonFilter,
      }),
    [records, search, dealerFilter, reasonFilter],
  );

  const columns: Column<ArbitrationRecord>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => getArbitrationVehicleName(row),
      cell: (row) => (
        <Link
          href={`/dealer/inventory/${row.id}`}
          className="flex min-w-[220px] items-center gap-3 hover:opacity-90"
        >
          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-sm border border-slate-700/80 bg-slate-900">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={getArbitrationVehicleName(row)}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-slate-600">
                <Car className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-white">
              {getArbitrationVehicleName(row)}
            </div>
            {getArbitrationVehicleSubtitle(row) && (
              <div className="truncate text-[11px] text-slate-500">
                {getArbitrationVehicleSubtitle(row)}
              </div>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      accessor: (row) => row.stockNumber,
      cell: (row) => (
        <span className="font-medium text-slate-200 tabular-nums">
          {row.stockNumber}
        </span>
      ),
    },
    {
      key: "vin",
      header: "VIN",
      sortable: true,
      accessor: (row) => row.vin,
      cellClassName: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) => (
        <span className="font-mono text-[10.5px] text-slate-400">{row.vin}</span>
      ),
    },
    {
      key: "buyerDealer",
      header: "Buyer / Dealer",
      sortable: true,
      accessor: (row) => row.buyerDealer,
      cell: (row) => (
        <span className="max-w-[160px] truncate text-slate-200">
          {row.buyerDealer}
        </span>
      ),
    },
    {
      key: "arbitrationReason",
      header: "Arbitration Reason",
      sortable: true,
      accessor: (row) => row.arbitrationReason,
      cell: (row) => (
        <div className="flex max-w-[180px] items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
          <span className="truncate text-slate-200">{row.arbitrationReason}</span>
        </div>
      ),
    },
    {
      key: "dateListed",
      header: "Date Listed",
      sortable: true,
      accessor: (row) => row.dateListed,
      cellClassName: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-slate-300 tabular-nums">
          {formatDisplayDate(row.dateListed)}
        </span>
      ),
    },
    {
      key: "latestNotePreview",
      header: "Added Notes",
      sortable: true,
      accessor: (row) => row.latestNotePreview,
      cellClassName: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (row) => (
        <span
          className={cn(
            "max-w-[180px] truncate text-[12px]",
            row.noteCount > 0 ? "text-slate-300" : "text-slate-500",
          )}
          title={row.latestNotePreview}
        >
          {row.latestNotePreview}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right pr-3 w-[120px]",
      cellClassName: "text-right pr-3 w-[120px]",
      cell: (row) => (
        <button
          type="button"
          onClick={() => onAddNote(row)}
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 transition-colors hover:border-emerald-500/70 hover:bg-emerald-500/10"
        >
          <StickyNote className="h-3.5 w-3.5" />
          Add Note
        </button>
      ),
    },
  ];

  const handleExport = () => {
    if (filtered.length === 0) return;
    downloadArbitrationCsv(filtered);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          Vehicles with arbitration status from the inventory.
        </p>
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11.5px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/40"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <InputGroup theme="dark" className="min-w-0 flex-1 lg:max-w-md">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search VIN, Stock #, Dealer, Reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-slate-200 placeholder:text-slate-500"
              disabled={isLoading}
            />
          </InputGroup>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={dealerFilter}
              onChange={setDealerFilter}
              placeholder="All Dealers"
              options={[
                { value: "all", label: "All Dealers" },
                ...dealers.map((dealer) => ({ value: dealer, label: dealer })),
              ]}
              className="w-full min-w-[140px] sm:w-[170px]"
              disabled={isLoading}
            />

            <FilterSelect
              value={reasonFilter}
              onChange={setReasonFilter}
              placeholder="All Reasons"
              options={[
                { value: "all", label: "All Reasons" },
                ...reasons.map((reason) => ({ value: reason, label: reason })),
              ]}
              className="w-full min-w-[140px] sm:w-[180px]"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleExport}
              disabled={isLoading || filtered.length === 0}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11.5px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:ml-auto sm:w-auto lg:ml-0 xl:ml-auto"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>
      )}

      <div className={`py-3.5 ${TABLE_WRAPPER_CLASS}`}>
        {records.length === 0 ? (
          <EmptyState variant="empty" />
        ) : filtered.length === 0 ? (
          <EmptyState variant="no-results" />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey="id"
            pageSize={8}
            addPagination
            loading={isLoading}
            emptyMessage="No arbitration vehicles match your filters."
            paginationSummaryLabel="vehicles"
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ variant }: { variant: "empty" | "no-results" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-slate-800 bg-[#0a101c]/40 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-800/80">
        <Car className="h-6 w-6 text-slate-500" />
      </div>
      <p className="text-[13px] font-medium text-white">
        {variant === "empty"
          ? "No vehicles in arbitration"
          : "No records match your filters"}
      </p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        {variant === "empty"
          ? "Set a vehicle's status to Arbitration in the Vehicles section to track it here."
          : "Try adjusting your search, dealer, or reason filters."}
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger theme="dark" className={cn("h-9 text-[11.5px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent theme="dark">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-[11.5px]">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
