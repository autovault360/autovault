"use client";

import { useMemo, useState } from "react";
import { Search, Download, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import MetricCell from "@/components/sales-reps/metric-cell";
import GoalProgressCell from "@/components/sales-reps/goal-progress-cell";
import SalesRepStatusBadge from "@/components/sales-reps/sales-rep-status-badge";
import SalesRepRowActions from "@/components/sales-reps/sales-rep-row-actions";
import { downloadSalesRepsCsv } from "@/lib/sales-reps/export-sales-reps";
import {
  SALES_REP_STATUSES,
  formatCurrency,
  formatPercent,
  formatSalesRepStatus,
  getSalesRepInitials,
  type SalesRepListItem,
  type SalesRepPeriod,
} from "@/lib/sales-reps/types";

type Props = {
  salesReps: SalesRepListItem[];
  period: SalesRepPeriod;
  onPeriodChange: (period: SalesRepPeriod) => void;
  isLoading?: boolean;
  onRowClick?: (row: SalesRepListItem) => void;
};

const PERIOD_OPTIONS: { value: SalesRepPeriod; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "ytd", label: "Year to Date" },
];

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card " +
  "[&_table]:min-w-[1180px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-4 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-card";

export default function SalesRepsInventory({
  salesReps,
  period,
  onPeriodChange,
  isLoading = false,
  onRowClick,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return salesReps.filter((rep) => {
      if (statusFilter !== "all" && rep.status !== statusFilter) return false;
      if (!q) return true;
      return (
        rep.fullName.toLowerCase().includes(q) ||
        rep.email.toLowerCase().includes(q)
      );
    });
  }, [salesReps, search, statusFilter]);

  const columns: Column<SalesRepListItem>[] = [
    {
      key: "fullName",
      header: "Sales Rep",
      sortable: true,
      accessor: (row) => row.fullName,
      cell: (row) => (
        <div className="flex min-w-[180px] items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-slate-700/80">
            {row.imageUrl && <AvatarImage src={row.imageUrl} alt={row.fullName} />}
            <AvatarFallback className="bg-blue-500/15 text-[11px] font-semibold text-blue-400">
              {getSalesRepInitials(row.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-white">
              {row.fullName}
            </div>
            <div className="truncate text-[13px] leading-tight text-slate-500">
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "unitsSold",
      header: "Units Sold",
      sortable: true,
      accessor: (row) => row.unitsSold,
      cell: (row) => (
        <MetricCell
          value={String(row.unitsSold)}
          delta={row.unitsSoldDelta}
          deltaColor={row.unitsSoldDeltaColor}
          sparkPoints={row.unitsSoldSparkPoints}
          sparkId={`units-${row.id}`}
        />
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <MetricCell
          value={formatCurrency(row.grossProfit)}
          delta={row.grossProfitDelta}
          deltaColor={row.grossProfitDeltaColor}
          sparkPoints={row.grossProfitSparkPoints}
          sparkId={`gross-${row.id}`}
        />
      ),
    },
    {
      key: "netProfit",
      header: "Net Profit",
      sortable: true,
      accessor: (row) => row.netProfit,
      cell: (row) => (
        <MetricCell
          value={formatCurrency(row.netProfit)}
          delta={row.netProfitDelta}
          deltaColor={row.netProfitDeltaColor}
          sparkPoints={row.netProfitSparkPoints}
          sparkId={`net-${row.id}`}
        />
      ),
    },
    {
      key: "totalSales",
      header: "Total Sales",
      sortable: true,
      accessor: (row) => row.totalSales,
      cell: (row) => (
        <MetricCell
          value={formatCurrency(row.totalSales)}
          delta={row.totalSalesDelta}
          deltaColor={row.totalSalesDeltaColor}
          sparkPoints={row.totalSalesSparkPoints}
          sparkId={`sales-${row.id}`}
        />
      ),
    },
    {
      key: "avgGrossPerUnit",
      header: "Avg. Gross / Unit",
      sortable: true,
      accessor: (row) => row.avgGrossPerUnit,
      cellClassName: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (row) => (
        <MetricCell
          value={formatCurrency(row.avgGrossPerUnit)}
          delta={row.avgGrossDelta}
          deltaColor={row.avgGrossDeltaColor}
          sparkPoints={row.avgGrossSparkPoints}
          sparkId={`avg-${row.id}`}
        />
      ),
    },
    {
      key: "conversionRate",
      header: "Conversion Rate",
      sortable: true,
      accessor: (row) => row.conversionRate,
      cellClassName: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) => (
        <MetricCell
          value={formatPercent(row.conversionRate)}
          delta={row.conversionDelta}
          deltaColor={row.conversionDeltaColor}
          sparkPoints={row.conversionSparkPoints}
          sparkId={`conv-${row.id}`}
        />
      ),
    },
    {
      key: "goals",
      header: "Goals",
      sortable: true,
      accessor: (row) => row.goalProgress,
      cellClassName: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <GoalProgressCell
          goalAmount={row.goalAmount}
          goalProgress={row.goalProgress}
          status={row.status}
          repId={row.id}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <SalesRepStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right pr-4 w-[100px]",
      cellClassName: "text-right pr-4 w-[100px]",
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <SalesRepRowActions salesRepId={row.id} />
        </div>
      ),
    },
  ];

  const handleExport = () => {
    if (filtered.length === 0) return;
    downloadSalesRepsCsv(filtered);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup theme="dark" className="max-w-sm flex-1 sm:flex-none">
          <InputGroupAddon>
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search Sales Reps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] text-slate-200 placeholder:text-slate-500"
            disabled={isLoading}
          />
        </InputGroup>

        <FilterSelect
          value={period}
          onChange={(value) => onPeriodChange(value as SalesRepPeriod)}
          placeholder="This Month"
          options={PERIOD_OPTIONS}
          className="w-[140px]"
          disabled={isLoading}
        />

        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Statuses"
          options={[
            { value: "all", label: "All Statuses" },
            ...SALES_REP_STATUSES.map((s) => ({
              value: s,
              label: formatSalesRepStatus(s),
            })),
          ]}
          className="w-[150px]"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading || filtered.length === 0}
          className="ml-auto flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11.5px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className={`py-3.5 ${TABLE_WRAPPER_CLASS}`}>
        {salesReps.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey="id"
            pageSize={10}
            addPagination
            emptyMessage="No sales reps match your filters."
            paginationSummaryLabel="sales reps"
            onRowClick={onRowClick}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-slate-800 bg-card px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-800/80">
        <Users className="h-6 w-6 text-slate-500" />
      </div>
      <p className="text-[13px] font-medium text-white">No sales reps found</p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        Add team members with a sales rep, manager, or owner role to start
        tracking performance metrics here.
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
      <SelectTrigger theme="dark" className={`h-9 text-[11.5px] ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent theme="dark">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[11.5px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
