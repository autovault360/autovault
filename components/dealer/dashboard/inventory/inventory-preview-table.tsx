"use client";

import Image from "next/image";
import { Eye, Pencil } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVENTORY_FOOTER } from "@/lib/dealer/dashboard/mock-data";
import {
  formatCurrency,
  formatCurrencyExact,
  potentialProfit,
  totalVehicleCost,
} from "@/lib/dealer/dashboard/calculations";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import { StatusBadge } from "../inventory-mini-panel";

export default function InventoryPreviewTable({
  vehicles,
  loading,
  onEdit,
  onView,
}: {
  vehicles: WholesaleVehicle[];
  loading?: boolean;
  onEdit: (vehicle: WholesaleVehicle) => void;
  onView: (vehicle: WholesaleVehicle) => void;
}) {
  const columns: Column<WholesaleVehicle>[] = [
    {
      key: "image",
      header: "Vehicle",
      cell: (row) => (
        <div className="relative h-8 w-12 overflow-hidden rounded bg-slate-800">
          {row.imageUrl ? (
            <Image
              src={row.imageUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
      ),
    },
    {
      key: "label",
      header: "Year/Make/Model",
      sortable: true,
      accessor: (row) => `${row.year} ${row.make} ${row.model}`,
      cell: (row) => (
        <span className="text-[11px] text-white">
          {row.year} {row.make} {row.model}
        </span>
      ),
    },
    {
      key: "vin",
      header: "VIN",
      cell: (row) => (
        <span className="font-mono text-[10px] text-slate-400">{row.vin}</span>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (row) => (
        <span className="tabular-nums text-[11px]">{row.stockNumber}</span>
      ),
    },
    {
      key: "purchaseDate",
      header: "Purchase Date",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">{row.purchaseDate}</span>
      ),
    },
    {
      key: "purchasePrice",
      header: "Purchase Price",
      sortable: true,
      accessor: (row) => row.costs.acquisition,
      cell: (row) => (
        <span className="tabular-nums text-[11px]">
          {formatCurrencyExact(row.costs.acquisition)}
        </span>
      ),
    },
    {
      key: "totalCost",
      header: "Total Cost",
      sortable: true,
      accessor: (row) => totalVehicleCost(row.costs),
      cell: (row) => (
        <span className="tabular-nums text-[11px]">
          {formatCurrencyExact(totalVehicleCost(row.costs))}
        </span>
      ),
    },
    {
      key: "marketValue",
      header: "Market Value",
      sortable: true,
      accessor: (row) => row.marketValue,
      cell: (row) => (
        <span className="tabular-nums text-[11px]">
          {formatCurrencyExact(row.marketValue)}
        </span>
      ),
    },
    {
      key: "potentialProfit",
      header: "Potential Profit",
      sortable: true,
      accessor: (row) => potentialProfit(row),
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-emerald-400">
          {formatCurrencyExact(potentialProfit(row))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "daysInLot",
      header: "Days in Lot",
      sortable: true,
      accessor: (row) => row.daysInLot,
      cell: (row) => (
        <span className="tabular-nums text-[11px]">{row.daysInLot}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <CardHead title="INVENTORY OVERVIEW" />
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-8 w-[120px] border-[#1e293b] bg-[#070c14]/60 text-[11px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0a101d]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_inventory">In Inventory</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-8 w-[100px] border-[#1e293b] bg-[#070c14]/60 text-[11px]">
              <SelectValue placeholder="Makes" />
            </SelectTrigger>
            <SelectContent className="border-[#1e293b] bg-[#0a101d]">
              <SelectItem value="all">All Makes</SelectItem>
            </SelectContent>
          </Select>
          <Input
            theme="dark"
            placeholder="Search..."
            className="h-8 w-36 border-[#1e293b] bg-[#070c14]/60 text-[11px]"
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 border-[#1e293b] bg-transparent text-[11px] text-slate-300"
          >
            Export
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        rowKey="id"
        addPagination
        pageSize={8}
        loading={loading}
        paginationSummaryLabel="vehicles"
      />

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#1e293b] pt-3 text-[11px]">
        <span className="text-[#64748b]">
          Total Vehicles:{" "}
          <strong className="text-white tabular-nums">
            {INVENTORY_FOOTER.totalVehicles}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Total Inventory Cost:{" "}
          <strong className="text-white tabular-nums">
            {formatCurrency(INVENTORY_FOOTER.totalInventoryCost)}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Total Market Value:{" "}
          <strong className="text-white tabular-nums">
            {formatCurrency(INVENTORY_FOOTER.totalMarketValue)}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Total Potential Profit:{" "}
          <strong className="text-emerald-400 tabular-nums">
            {formatCurrency(INVENTORY_FOOTER.totalPotentialProfit)}
          </strong>
        </span>
      </div>
    </CardShell>
  );
}
