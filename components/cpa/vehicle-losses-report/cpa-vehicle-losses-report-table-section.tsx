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
import type {
  CpaLossReason,
  CpaLossTab,
  CpaVehicleLossRow,
} from "@/lib/cpa/vehicle-losses-report/types";
import {
  formatLossMoney,
  formatLossPercent,
  formatReportMoney,
} from "@/lib/cpa/vehicle-losses-report/utils";

const TABS: { id: CpaLossTab; label: string }[] = [
  { id: "all", label: "All Losses" },
  { id: "sold_at_loss", label: "Sold at a Loss" },
  { id: "returned_to_auction", label: "Returned to Auction" },
  { id: "unsold_inventory", label: "Unsold Inventory Losses" },
];

function statusBadgeClass(status: string) {
  if (status === "Returned to Auction") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (status === "Unsold Inventory") {
    return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  }
  return "bg-orange-500/15 text-orange-400 border-orange-500/30";
}

function reasonBadgeClass(reason: CpaLossReason) {
  switch (reason) {
    case "Market Depreciation":
      return "bg-violet-500/15 text-violet-400 border-violet-500/30";
    case "Overpaid at Auction":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "High Reconditioning":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "Mechanical Issues":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-600/30";
  }
}

export default function CpaVehicleLossesReportTableSection({
  vehicles,
  makeOptions,
  vehicleTypeOptions,
  lossReasonOptions,
  activeTab,
  onTabChange,
  dataAsOf,
  loading,
}: {
  vehicles: CpaVehicleLossRow[];
  makeOptions: string[];
  vehicleTypeOptions: string[];
  lossReasonOptions: CpaLossReason[];
  activeTab: CpaLossTab;
  onTabChange: (tab: CpaLossTab) => void;
  dataAsOf?: string;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    makeFilter !== "all" ||
    typeFilter !== "all" ||
    reasonFilter !== "all" ||
    search.trim().length > 0;

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      if (makeFilter !== "all" && vehicle.make !== makeFilter) return false;
      if (typeFilter !== "all" && vehicle.vehicleType !== typeFilter) return false;
      if (reasonFilter !== "all" && vehicle.lossReason !== reasonFilter) return false;
      if (!query) return true;

      return (
        vehicle.stockNumber.toLowerCase().includes(query) ||
        vehicle.yearMakeModel.toLowerCase().includes(query) ||
        vehicle.vin.toLowerCase().includes(query) ||
        vehicle.status.toLowerCase().includes(query) ||
        vehicle.lossReason.toLowerCase().includes(query)
      );
    });
  }, [vehicles, makeFilter, typeFilter, reasonFilter, search]);

  const resetFilters = () => {
    setMakeFilter("all");
    setTypeFilter("all");
    setReasonFilter("all");
    setSearch("");
    setFiltersOpen(false);
  };

  const columns: Column<CpaVehicleLossRow>[] = [
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
      key: "date",
      header: "Date",
      sortable: true,
      accessor: (row) => row.date,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => (
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            statusBadgeClass(row.status),
          )}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "vehicleCost",
      header: "Cost of Vehicle",
      sortable: true,
      accessor: (row) => row.vehicleCost,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatReportMoney(row.vehicleCost)}
        </span>
      ),
    },
    {
      key: "reconditioning",
      header: "Reconditioning",
      sortable: true,
      accessor: (row) => row.reconditioning,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-slate-300">
          {formatReportMoney(row.reconditioning)}
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
        <span className="tabular-nums text-[12px] text-white">
          {formatReportMoney(row.totalCost)}
        </span>
      ),
    },
    {
      key: "salePriceOrResult",
      header: "Sale Price / Result",
      sortable: true,
      accessor: (row) => row.salePriceOrResult,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-slate-300">
          {formatReportMoney(row.salePriceOrResult)}
        </span>
      ),
    },
    {
      key: "lossAmount",
      header: "Loss ($)",
      sortable: true,
      accessor: (row) => row.lossAmount,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] font-medium text-red-400">
          {formatLossMoney(row.lossAmount)}
        </span>
      ),
    },
    {
      key: "lossPct",
      header: "Loss %",
      sortable: true,
      accessor: (row) => row.lossPct,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-red-400">
          {formatLossPercent(row.lossPct)}
        </span>
      ),
    },
    {
      key: "lossReason",
      header: "Loss Reason",
      sortable: true,
      accessor: (row) => row.lossReason,
      cell: (row) => (
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            reasonBadgeClass(row.lossReason),
          )}
        >
          {row.lossReason}
        </span>
      ),
    },
  ];

  return (
    <CardShell>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-800 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "border-b-2 pb-2 text-[12px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search stock, VIN, model..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-full min-w-[180px] border-slate-700 bg-[#060d18] text-[11px] sm:w-[220px]"
          />

          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[130px] text-[11px]">
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
            <SelectTrigger theme="dark" className="h-8 w-[130px] text-[11px]">
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

          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[150px] text-[11px]">
              <SelectValue placeholder="All Reasons" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Reasons
              </SelectItem>
              {lossReasonOptions.map((reason) => (
                <SelectItem key={reason} value={reason} className="text-[11px]">
                  {reason}
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

      <div className="mb-3 text-[12px] font-bold tracking-[0.12em] text-white">
        {`VEHICLES WITH LOSSES (${filteredVehicles.length})`}
      </div>

      {filtersOpen ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-[#060d18] px-3 py-2 text-[11px] text-slate-400">
          Filter vehicles by make, vehicle type, loss reason, or search keywords. Use Reset to
          clear all filters.
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredVehicles}
          rowKey="id"
          loading={loading}
          pageSize={10}
          addPagination
          paginationSummaryLabel="vehicles"
          emptyMessage="No vehicles with losses match your filters for this period."
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        <span>All amounts are in USD</span>
        <span>{dataAsOf ? `Data as of ${dataAsOf}` : "Read-only reporting view"}</span>
      </div>
    </CardShell>
  );
}
