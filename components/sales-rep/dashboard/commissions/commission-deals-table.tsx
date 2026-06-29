"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, MoreVertical, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import CommissionStatusBadge from "@/components/deal-jackets/commission-status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import type { ISalesRepCommissionRow } from "@/lib/sales-rep/commissions/types";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1200px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

type Props = {
  entries: ISalesRepCommissionRow[];
  periodLabel: string;
  totalCommission: number;
  loading?: boolean;
};

export default function CommissionDealsTable({
  entries,
  periodLabel,
  totalCommission,
  loading,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dealFilter, setDealFilter] = useState("all");

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (dealFilter !== "all" && row.dealJacketId !== dealFilter) return false;
      if (!query) return true;
      return (
        row.dealJacketId.toLowerCase().includes(query) ||
        row.vehicle.toLowerCase().includes(query) ||
        row.buyerName.toLowerCase().includes(query)
      );
    });
  }, [entries, search, statusFilter, dealFilter]);

  const columns: Column<ISalesRepCommissionRow>[] = [
    {
      key: "dealJacketId",
      header: "Deal Jacket #",
      sortable: true,
      cell: (row) => (
        <Link
          href="#"
          className="font-mono text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          {row.dealJacketId}
        </Link>
      ),
    },
    {
      key: "dateSold",
      header: "Date Sold",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-300">{row.dateSold}</span>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (row) => (
        <span className="text-[11px] text-slate-200">{row.vehicle}</span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="tabular-nums text-[11px] text-slate-200">
          {formatCommissionPrice(row.salePrice)}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      accessor: (row) => row.cost,
      cell: (row) => (
        <span className="tabular-nums text-[11px] text-slate-300">
          {formatCommissionPrice(row.cost)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums text-[11px] text-slate-200">
          {formatCommissionPrice(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "commissionRate",
      header: "Commission %",
      cell: (row) => (
        <span className="tabular-nums text-[11px] text-slate-300">
          {row.commissionRate}%
        </span>
      ),
    },
    {
      key: "commissionEarned",
      header: "Commission Earned",
      sortable: true,
      accessor: (row) => row.commissionEarned,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-medium text-slate-200">
          {formatCommissionCurrency(row.commissionEarned)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <CommissionStatusBadge status={row.status} />,
    },
    {
      key: "paidDate",
      header: "Paid Date",
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {row.paidDate ?? "�€”"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: () => (
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          aria-label="Row actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex h-8 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-slate-700/80 bg-slate-800/50 px-2.5 text-[11px] text-slate-300 sm:max-w-[280px]"
        >
          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate">{periodLabel}</span>
          <Calendar className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-500" />
        </button>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            theme="dark"
            className="w-[120px]"
          >
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent
            theme="dark"
            className="border-slate-700/80 bg-card"
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dealFilter} onValueChange={setDealFilter}>
          <SelectTrigger
            theme="dark"
            className="w-[140px]"
          >
            <SelectValue placeholder="All Deal Jackets" />
          </SelectTrigger>
          <SelectContent
            theme="dark"
            className="border-slate-700/80 bg-card"
          >
            <SelectItem value="all">All Deal Jackets</SelectItem>
            {entries.map((row) => (
              <SelectItem key={row.dealJacketId} value={row.dealJacketId}>
                {row.dealJacketId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-[200px] flex-1 sm:min-w-[260px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            theme="dark"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Deal Jacket #, Vehicle, or Buyer..."
            className="pl-8"
          />
        </div>
      </div>

      <div className={cn(TABLE_WRAPPER_CLASS, "relative")}>
        <DataTable
          columns={columns}
          data={filteredEntries}
          rowKey="id"
          addPagination
          pageSize={16}
          loading={loading}
          paginationSummaryLabel="entries"
        />
        {!loading && filteredEntries.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-slate-500">
              Total
            </span>
            <span className="font-mono text-[13px] font-bold tabular-nums text-emerald-400">
              {formatCommissionCurrency(totalCommission)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
