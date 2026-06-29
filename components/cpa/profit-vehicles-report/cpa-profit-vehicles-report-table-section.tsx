"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell } from "@/components/dashboard/card-shell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CpaProfitVehicleRow } from "@/lib/cpa/profit-vehicles-report/types";
import { formatReportMoney, formatReportPercent } from "@/lib/cpa/profit-vehicles-report/utils";

function marginBadgeClass(margin: CpaProfitVehicleRow["profitMargin"]) {
  if (margin === "High") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (margin === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-slate-500/15 text-slate-400 border-slate-600/30";
}

export default function CpaProfitVehiclesReportTableSection({
  vehicles,
  makeOptions,
  vehicleTypeOptions,
  loading,
}: {
  vehicles: CpaProfitVehicleRow[];
  makeOptions: string[];
  vehicleTypeOptions: string[];
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    makeFilter !== "all" || typeFilter !== "all" || search.trim().length > 0;

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      if (makeFilter !== "all" && vehicle.make !== makeFilter) return false;
      if (typeFilter !== "all" && vehicle.vehicleType !== typeFilter) return false;
      if (!query) return true;

      return (
        vehicle.stockNumber.toLowerCase().includes(query) ||
        vehicle.yearMakeModel.toLowerCase().includes(query) ||
        vehicle.vin.toLowerCase().includes(query) ||
        vehicle.vehicleType.toLowerCase().includes(query)
      );
    });
  }, [vehicles, makeFilter, typeFilter, search]);

  const resetFilters = () => {
    setMakeFilter("all");
    setTypeFilter("all");
    setSearch("");
    setFiltersOpen(false);
  };

  const columns: Column<CpaProfitVehicleRow>[] = [
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      accessor: (row) => row.stockNumber,
      cell: (row) => (
        <span className="text-[12px] font-medium text-blue-400">{row.stockNumber}</span>
      ),
    },
    {
      key: "yearMakeModel",
      header: "Year / Make / Model",
      sortable: true,
      accessor: (row) => row.yearMakeModel,
      cell: (row) => (
        <span className="text-[12px] text-white">{row.yearMakeModel}</span>
      ),
    },
    {
      key: "vin",
      header: "VIN",
      sortable: true,
      accessor: (row) => row.vin,
      cell: (row) => (
        <span className="font-mono text-[10px] text-slate-500">{row.vin}</span>
      ),
    },
    {
      key: "dateSold",
      header: "Date Sold",
      sortable: true,
      accessor: (row) => row.dateSold,
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatReportMoney(row.salePrice)}
        </span>
      ),
    },
    {
      key: "totalCost",
      header: "Total Cost",
      sortable: true,
      accessor: (row) => row.totalCost,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-slate-300">
          {formatReportMoney(row.totalCost)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit ($)",
      sortable: true,
      accessor: (row) => row.grossProfit,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] font-medium text-emerald-400">
          {formatReportMoney(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "grossProfitPct",
      header: "Gross Profit (%)",
      sortable: true,
      accessor: (row) => row.grossProfitPct,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatReportPercent(row.grossProfitPct)}
        </span>
      ),
    },
    {
      key: "profitMargin",
      header: "Profit Margin",
      sortable: true,
      accessor: (row) => row.profitMargin,
      cell: (row) => (
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            marginBadgeClass(row.profitMargin),
          )}
        >
          {row.profitMargin}
        </span>
      ),
    },
    {
      key: "profitPerDay",
      header: "Profit Per Day",
      sortable: true,
      accessor: (row) => row.profitPerDay,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-slate-300">
          {formatReportMoney(row.profitPerDay)}
        </span>
      ),
    },
    {
      key: "vehicleType",
      header: "Vehicle Type",
      sortable: true,
      accessor: (row) => row.vehicleType,
    },
  ];

  return (
    <CardShell>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-[12px] w-full font-bold tracking-[0.12em] text-white">
          {`PROFITABLE VEHICLES (${filteredVehicles.length})`}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end w-full">
          <Input
            placeholder="Search stock, VIN, model..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            theme="dark"
            className="max-w-[230px]"
          />

          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[140px] text-[11px]">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Makes
              </SelectItem>
              {makeOptions.map((make) => (
                <SelectItem key={make} value={make} className="text-[11px]">
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[140px] text-[11px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Types
              </SelectItem>
              {vehicleTypeOptions.map((type) => (
                <SelectItem key={type} value={type} className="text-[11px]">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] transition-colors",
              filtersOpen || hasActiveFilters
                ? "border-blue-500/50 text-blue-400"
                : "border-slate-700 text-slate-300",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-8 items-center gap-1 rounded-md border border-slate-700 px-2.5 text-[11px] text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-[#060d18] px-3 py-2 text-[11px] text-slate-400">
          Filter profitable vehicles by make, vehicle type, or search keywords. Use Reset to
          clear all filters.
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={filteredVehicles}
        rowKey="id"
        loading={loading}
        pageSize={10}
        addPagination
        paginationSummaryLabel="vehicles"
        emptyMessage="No profitable vehicles match your filters for this period."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        <span>All amounts are in USD</span>
        <span>Read-only reporting view</span>
      </div>
    </CardShell>
  );
}
