"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Car, Download, Search } from "lucide-react";
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
import { filterMissingTitleRecords } from "@/lib/dealer/missing-titles/filter-missing-titles";
import { downloadMissingTitlesCsv } from "@/lib/dealer/missing-titles/export-missing-titles";
import {
  formatDisplayDate,
  getDaysMissingColor,
  getMissingTitleVehicleName,
  type DaysMissingFilter,
  type MissingTitleRecord,
} from "@/lib/dealer/missing-titles/types";
import MissingTitleStatusBadge from "./missing-title-status-badge";
import MissingTitleRowActions from "./missing-title-row-actions";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[1180px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-3.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-[#0a101c]/30";

const DAYS_MISSING_OPTIONS: { value: DaysMissingFilter; label: string }[] = [
  { value: "all", label: "All Days Missing" },
  { value: "over_30", label: "Over 30 Days" },
  { value: "over_60", label: "Over 60 Days" },
  { value: "over_90", label: "Over 90 Days" },
];

type Props = {
  records: MissingTitleRecord[];
  locations: string[];
  isLoading?: boolean;
};

export default function MissingTitlesTable({
  records,
  locations,
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [daysMissingFilter, setDaysMissingFilter] =
    useState<DaysMissingFilter>("all");

  const filtered = useMemo(
    () =>
      filterMissingTitleRecords(records, {
        search,
        location: locationFilter,
        daysMissing: daysMissingFilter,
      }),
    [records, search, locationFilter, daysMissingFilter],
  );

  const locationOptions = useMemo(
    () =>
      locations.filter((location) => location !== "All Locations").sort(),
    [locations],
  );

  const columns: Column<MissingTitleRecord>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => getMissingTitleVehicleName(row),
      cell: (row) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-sm border border-slate-700/80 bg-slate-900">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={getMissingTitleVehicleName(row)}
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
              {getMissingTitleVehicleName(row)}
            </div>
          </div>
        </div>
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
      key: "dateAcquired",
      header: "Date Acquired",
      sortable: true,
      accessor: (row) => row.dateAcquired,
      cellClassName: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-slate-300 tabular-nums">
          {formatDisplayDate(row.dateAcquired)}
        </span>
      ),
    },
    {
      key: "daysMissing",
      header: "Days Missing",
      sortable: true,
      accessor: (row) => row.daysMissing,
      cell: (row) => (
        <span
          className={cn(
            "font-semibold tabular-nums",
            getDaysMissingColor(row.daysMissing),
          )}
        >
          {row.daysMissing}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      sortable: true,
      accessor: (row) => row.reason,
      cellClassName: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (row) => (
        <span className="max-w-[160px] truncate text-slate-300">{row.reason}</span>
      ),
    },
    {
      key: "lastUpdate",
      header: "Last Update",
      sortable: true,
      accessor: (row) => row.lastUpdate,
      cellClassName: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-slate-400 tabular-nums">
          {formatDisplayDate(row.lastUpdate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <MissingTitleStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right pr-3 w-[120px]",
      cellClassName: "text-right pr-3 w-[120px]",
      cell: () => <MissingTitleRowActions />,
    },
  ];

  const handleExport = () => {
    if (filtered.length === 0) return;
    downloadMissingTitlesCsv(filtered);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <InputGroup theme="dark" className="min-w-0 flex-1 lg:max-w-md">
          <InputGroupAddon>
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by VIN, Stock #, Year, Make, Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] text-slate-200 placeholder:text-slate-500"
            disabled={isLoading}
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={locationFilter}
            onChange={setLocationFilter}
            placeholder="All Locations"
            options={[
              { value: "all", label: "All Locations" },
              ...locationOptions.map((location) => ({
                value: location,
                label: location,
              })),
            ]}
            className="w-full min-w-[140px] sm:w-[160px]"
            disabled={isLoading}
          />

          <FilterSelect
            value={daysMissingFilter}
            onChange={(value) =>
              setDaysMissingFilter(value as DaysMissingFilter)
            }
            placeholder="All Days Missing"
            options={DAYS_MISSING_OPTIONS}
            className="w-full min-w-[140px] sm:w-[170px]"
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
            emptyMessage="No missing title records match your filters."
            paginationSummaryLabel="missing titles"
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
          ? "No missing title records yet"
          : "No records match your filters"}
      </p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        {variant === "empty"
          ? "Add a missing title record to start tracking title status and follow-ups."
          : "Try adjusting your search, location, or days missing filters."}
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
