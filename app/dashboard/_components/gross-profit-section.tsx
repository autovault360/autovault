"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import type { AdminGrossProfitRow } from "@/lib/dashboard/admin/types";
import DashboardExpandableShell from "./dashboard-expandable-shell";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1100px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

type Props = {
  periodLabel: string;
  rows: AdminGrossProfitRow[];
};

export default function GrossProfitSection({ periodLabel, rows }: Props) {
  const [search, setSearch] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("all");
  const [dealTypeFilter, setDealTypeFilter] = useState("all");

  const salesRepOptions = useMemo(() => {
    const ids = new Set(rows.map((r) => r.salesRepId).filter(Boolean));
    return [...ids] as string[];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (salesRepFilter !== "all" && row.salesRepId !== salesRepFilter) {
        return false;
      }
      if (dealTypeFilter !== "all" && row.dealType !== dealTypeFilter) {
        return false;
      }
      if (!query) return true;
      return (
        row.vehicleLabel.toLowerCase().includes(query) ||
        row.stockNumber.toLowerCase().includes(query)
      );
    });
  }, [rows, search, salesRepFilter, dealTypeFilter]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => ({
        purchaseCost: acc.purchaseCost + row.purchaseCost,
        reconCost: acc.reconCost + row.reconCost,
        totalCost: acc.totalCost + row.totalCost,
        salePrice: acc.salePrice + row.salePrice,
        grossProfit: acc.grossProfit + row.grossProfit,
        commissionEarned: acc.commissionEarned + row.commissionEarned,
      }),
      {
        purchaseCost: 0,
        reconCost: 0,
        totalCost: 0,
        salePrice: 0,
        grossProfit: 0,
        commissionEarned: 0,
      },
    );
  }, [filteredRows]);

  const columns: Column<AdminGrossProfitRow>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (row) => (
        <div className="flex min-w-[180px] items-center gap-2">
          <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded bg-slate-800">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={row.vehicleLabel}
                fill
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
          <span className="text-slate-200">{row.vehicleLabel}</span>
        </div>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-300">{row.stockNumber}</span>
      ),
    },
    {
      key: "saleDate",
      header: "Sale Date",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-300">
          {row.saleDate
            ? new Date(`${row.saleDate}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      key: "purchaseCost",
      header: "Purchase Cost",
      sortable: true,
      accessor: (row) => row.purchaseCost,
      cell: (row) => (
        <span className="tabular-nums text-slate-300">
          {formatCurrency(row.purchaseCost)}
        </span>
      ),
    },
    {
      key: "reconCost",
      header: "Recon Cost",
      sortable: true,
      accessor: (row) => row.reconCost,
      cell: (row) => (
        <span className="tabular-nums text-slate-300">
          {formatCurrency(row.reconCost)}
        </span>
      ),
    },
    {
      key: "totalCost",
      header: "Total Cost",
      sortable: true,
      accessor: (row) => row.totalCost,
      cell: (row) => (
        <span className="tabular-nums text-slate-300">
          {formatCurrency(row.totalCost)}
        </span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="tabular-nums text-slate-200">
          {formatCurrency(row.salePrice)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums font-medium text-emerald-400">
          {formatCurrency(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "commissionRate",
      header: "Commission %",
      cell: (row) => (
        <span className="tabular-nums text-slate-300">{row.commissionRate}%</span>
      ),
    },
    {
      key: "commissionEarned",
      header: "Commission Earned",
      sortable: true,
      accessor: (row) => row.commissionEarned,
      cell: (row) => (
        <span className="tabular-nums font-medium text-emerald-400">
          {formatCurrency(row.commissionEarned)}
        </span>
      ),
    },
  ];

  function handleExport() {
    const header = [
      "Vehicle",
      "Stock #",
      "Sale Date",
      "Purchase Cost",
      "Recon Cost",
      "Total Cost",
      "Sale Price",
      "Gross Profit",
      "Commission %",
      "Commission Earned",
    ];
    const lines = filteredRows.map((row) =>
      [
        row.vehicleLabel,
        row.stockNumber,
        row.saleDate,
        row.purchaseCost,
        row.reconCost,
        row.totalCost,
        row.salePrice,
        row.grossProfit,
        row.commissionRate,
        row.commissionEarned,
      ].join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gross-profit-center.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardExpandableShell
      sectionNumber={5}
      title="GROSS PROFIT CENTER"
      defaultExpanded={true}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-bold tracking-[0.14em] text-white">
          GROSS PROFIT CENTER
        </div>
        <span className="text-[11px] text-slate-400">{periodLabel}</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select value={salesRepFilter} onValueChange={setSalesRepFilter}>
          <SelectTrigger className="h-8 w-[140px] border-slate-800 bg-card text-[11px]">
            <SelectValue placeholder="All Sales Reps" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-card">
            <SelectItem value="all">All Sales Reps</SelectItem>
            {salesRepOptions.map((id) => (
              <SelectItem key={id} value={id!}>
                Rep {id!.slice(0, 6)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
          <SelectTrigger className="h-8 w-[130px] border-slate-800 bg-card text-[11px]">
            <SelectValue placeholder="All Deal Types" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-card">
            <SelectItem value="all">All Deal Types</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="financed">Financed</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle or stock #..."
            className="h-8 border-slate-800 bg-card pl-8 text-[11px]"
          />
        </div>

        <Button
          type="button"
          onClick={handleExport}
          className="h-8 gap-1.5 bg-blue-600 px-3 text-[11px] hover:bg-blue-500"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      <div className={TABLE_WRAPPER_CLASS}>
        <DataTable
          data={filteredRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No sold vehicles for this period."
        />
      </div>

      <div className="mt-3 overflow-x-auto rounded-sm border border-slate-800/60 bg-card px-3 py-2.5">
        <div className="flex min-w-[900px] items-center gap-4 text-[11px]">
          <span className="font-semibold text-slate-300">
            Total Vehicles Sold: {filteredRows.length}
          </span>
          <span className="text-slate-500">
            Purchase:{" "}
            <span className="text-slate-200">
              {formatCurrency(totals.purchaseCost)}
            </span>
          </span>
          <span className="text-slate-500">
            Recon:{" "}
            <span className="text-slate-200">
              {formatCurrency(totals.reconCost)}
            </span>
          </span>
          <span className="text-slate-500">
            Total Cost:{" "}
            <span className="text-slate-200">
              {formatCurrency(totals.totalCost)}
            </span>
          </span>
          <span className="text-slate-500">
            Sale Price:{" "}
            <span className="text-slate-200">
              {formatCurrency(totals.salePrice)}
            </span>
          </span>
          <span className="text-slate-500">
            Gross Profit:{" "}
            <span className="font-medium text-emerald-400">
              {formatCurrency(totals.grossProfit)}
            </span>
          </span>
          <span className="text-slate-500">
            Commission:{" "}
            <span className="font-medium text-emerald-400">
              {formatCurrency(totals.commissionEarned)}
            </span>
          </span>
        </div>
      </div>
    </DashboardExpandableShell>
  );
}
