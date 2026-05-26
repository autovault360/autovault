"use client";

import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import MetricCell from "@/components/sales-reps/metric-cell";
import GoalProgressCell from "@/components/sales-reps/goal-progress-cell";
import SalesRepStatusBadge from "@/components/sales-reps/sales-rep-status-badge";
import SalesRepRowActions from "@/components/sales-reps/sales-rep-row-actions";
import {
  SALES_REP_STATUSES,
  formatCurrency,
  formatPercent,
  formatSalesRepStatus,
  getSalesRepInitials,
  type SalesRepListItem,
} from "@/lib/sales-reps/types";

type Props = {
  salesReps: SalesRepListItem[];
};

const PERIOD_OPTIONS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "ytd", label: "Year to Date" },
];

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[1180px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-4 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-[#0a101c]/30";

export default function SalesRepsInventory({ salesReps }: Props) {
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("this_month");
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
            <AvatarFallback className="bg-blue-500/15 text-[11px] font-semibold text-blue-400">
              {getSalesRepInitials(row.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-white">
              {row.fullName}
            </div>
            <div className="truncate text-[10.5px] leading-tight text-slate-500">
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
      cell: () => <SalesRepRowActions />,
    },
  ];

  return (
    <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent shadow-none">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-800/80 p-3.5">
        <InputGroup theme="dark" className="max-w-sm flex-1 sm:flex-none">
          <InputGroupAddon>
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search Sales Reps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] text-slate-200 placeholder:text-slate-500"
          />
        </InputGroup>

        <FilterSelect
          value={periodFilter}
          onChange={setPeriodFilter}
          placeholder="This Month"
          options={PERIOD_OPTIONS}
          className="w-[140px]"
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
        />

        <button
          type="button"
          className="ml-auto flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11.5px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className={`px-3.5 py-3.5 ${TABLE_WRAPPER_CLASS}`}>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          pageSize={10}
          addPagination
          emptyMessage="No sales reps found."
          paginationSummaryLabel="sales reps"
        />
      </div>
    </Card>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
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
