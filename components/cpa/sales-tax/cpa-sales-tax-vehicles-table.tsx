"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell } from "@/components/dashboard/card-shell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CpaSalesTaxPageData,
  CpaSalesTaxVehicleRow,
} from "@/lib/cpa/sales-tax/types";
import { formatMoney, formatPercent } from "@/components/cpa/dashboard/cpa-dashboard-utils";

type TabId = "all" | "sold" | "unsold";

function currencyCell(value: number, className?: string, fractionDigits = 2) {
  return (
    <span className={cn("tabular-nums text-[12px] text-white", className)}>
      {formatMoney(value, fractionDigits)}
    </span>
  );
}

function statusBadge(status: CpaSalesTaxVehicleRow["status"]) {
  if (status === "Paid") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/15">
        Paid
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/15 text-[10px] font-medium text-amber-300 hover:bg-amber-500/15">
        Pending
      </Badge>
    );
  }

  return (
    <Badge className="border-slate-600/40 bg-slate-800/60 text-[10px] font-medium text-slate-400 hover:bg-slate-800/60">
      Unsold
    </Badge>
  );
}

export default function CpaSalesTaxVehiclesTable({
  data,
  loading,
}: {
  data: CpaSalesTaxPageData;
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [makeFilter, setMakeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredVehicles = useMemo(() => {
    return data.vehicles.filter((vehicle) => {
      if (activeTab === "sold" && !vehicle.isSold) return false;
      if (activeTab === "unsold" && vehicle.isSold) return false;
      if (makeFilter !== "all" && vehicle.make !== makeFilter) return false;
      if (typeFilter !== "all" && vehicle.vehicleType !== typeFilter) return false;
      return true;
    });
  }, [data.vehicles, activeTab, makeFilter, typeFilter]);

  const columns: Column<CpaSalesTaxVehicleRow>[] = [
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      accessor: (row) => row.stockNumber,
      cell: (row) =>
        row.isSold ? (
          <Link
            href={`/cpa/deal-jackets/${row.id}`}
            className="text-[12px] font-medium text-blue-400 hover:underline"
          >
            {row.stockNumber}
          </Link>
        ) : (
          <span className="text-[12px] font-medium text-blue-400">{row.stockNumber}</span>
        ),
    },
    {
      key: "vin",
      header: "VIN",
      sortable: true,
      accessor: (row) => row.vin,
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
      key: "dateSold",
      header: "Date Sold",
      sortable: true,
      accessor: (row) => row.dateSold ?? "",
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.salePrice),
    },
    {
      key: "taxRate",
      header: "Tax Rate",
      sortable: true,
      accessor: (row) => row.taxRate,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {row.isSold ? formatPercent(row.taxRate) : "-"}
        </span>
      ),
    },
    {
      key: "salesTaxCollected",
      header: "Sales Tax Collected",
      sortable: true,
      accessor: (row) => row.salesTaxCollected,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.salesTaxCollected, "text-emerald-400"),
    },
    {
      key: "salesTaxRemitted",
      header: "Sales Tax Remitted",
      sortable: true,
      accessor: (row) => row.salesTaxRemitted,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.salesTaxRemitted, "text-blue-400"),
    },
    {
      key: "adjustments",
      header: "Adjustments / Credits",
      sortable: true,
      accessor: (row) => row.adjustments,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) =>
        currencyCell(
          row.adjustments,
          row.adjustments < 0 ? "text-red-400" : undefined,
        ),
    },
    {
      key: "taxPayable",
      header: "Tax Payable",
      sortable: true,
      accessor: (row) => row.taxPayable,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.taxPayable, "text-violet-400"),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => statusBadge(row.status),
    },
    {
      key: "remittedDate",
      header: "Remitted Date",
      sortable: true,
      accessor: (row) => row.remittedDate ?? "",
      cell: (row) => (
        <span className="text-[12px] text-slate-300">{row.remittedDate ?? "-"}</span>
      ),
    },
  ];

  const soldCount = filteredVehicles.filter((vehicle) => vehicle.isSold).length;

  return (
    <CardShell>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-0">
          {(
            [
              { id: "all", label: "All Vehicles" },
              { id: "sold", label: "Sold Vehicles" },
              { id: "unsold", label: "Unsold Inventory" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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
          <Select value={makeFilter} onValueChange={setMakeFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[140px] text-[11px]">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Makes
              </SelectItem>
              {data.makeOptions.map((make) => (
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
              {data.typeOptions.map((type) => (
                <SelectItem key={type} value={type} className="text-[11px]">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11px] text-slate-300"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="mb-2 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        SALES TAX BY VEHICLE ({soldCount})
      </div>

      <DataTable
        columns={columns}
        data={filteredVehicles}
        rowKey="id"
        pageSize={15}
        addPagination
        paginationSummaryLabel="vehicles"
        loading={loading}
        Total={soldCount > 0}
        TotalColumns={[4, 6, 7, 8, 9]}
        totalRowLabel={`TOTAL (${soldCount} Vehicles)`}
        totalColumnClassNames={{
          6: "text-emerald-400",
          7: "text-blue-400",
          9: "text-violet-400",
        }}
        emptyMessage="No vehicles match your filters for this period."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        <span>All amounts are in USD</span>
        <span>Data as of {data.dataAsOf}</span>
      </div>
    </CardShell>
  );
}
