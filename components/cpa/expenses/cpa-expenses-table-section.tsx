"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  FileText,
  Megaphone,
  MoreHorizontal,
  Shield,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CpaExpenseCategoryRow,
  CpaExpensesPageData,
} from "@/lib/cpa/expenses/types";
import { formatMoney, formatPercent } from "@/components/cpa/dashboard/cpa-dashboard-utils";

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  payroll: { icon: Users, bg: "bg-violet-700"},
  advertising: { icon: Megaphone, bg: "bg-blue-500"},
  rent: { icon: Building2, bg: "bg-orange-600"},
  utilities: { icon: Zap, bg: "bg-green-700"},
  repairs: { icon: Wrench, bg: "bg-yellow-500"},
  insurance: { icon: Shield, bg: "bg-blue-500"},
  office: { icon: FileText, bg: "bg-teal-700"},
  other: { icon: MoreHorizontal, bg: "bg-slate-500"},
};

function CategoryCell({ row }: { row: CpaExpenseCategoryRow }) {
  const meta = CATEGORY_ICONS[row.id] ?? CATEGORY_ICONS.other!;
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-white",
          meta.bg,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-[12px] font-medium text-white">{row.label}</span>
    </div>
  );
}

function TrendSparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const data = values.map((value, index) => ({ index, value }));
  const hasData = values.some((v) => v > 0);

  if (!hasData) {
    return <span className="text-[11px] text-slate-600">-</span>;
  }

  return (
    <div className="h-8 w-[88px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function VsPriorCell({ row }: { row: CpaExpenseCategoryRow }) {
  if (row.amount === 0 && row.vsPriorPct === 0) {
    return <span className="text-[12px] text-slate-600">-</span>;
  }

  const isUp = row.vsPriorDirection === "up";
  const isDown = row.vsPriorDirection === "down";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-medium tabular-nums",
        isUp && "text-red-400",
        isDown && "text-emerald-400",
        !isUp && !isDown && "text-slate-500",
      )}
    >
      {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
      {row.vsPriorPct.toFixed(1)}%
    </span>
  );
}

export default function CpaExpensesTableSection({
  data,
  loading,
}: {
  data: CpaExpensesPageData;
  loading: boolean;
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredCategories = useMemo(() => {
    if (categoryFilter === "all") return data.categories;
    return data.categories.filter((row) => row.label === categoryFilter);
  }, [data.categories, categoryFilter]);

  const columns: Column<CpaExpenseCategoryRow>[] = [
    {
      key: "label",
      header: "Category",
      sortable: true,
      accessor: (row) => row.label,
      cell: (row) => <CategoryCell row={row} />,
    },
    {
      key: "amount",
      header: "Total Expense",
      sortable: true,
      accessor: (row) => row.amount,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] font-medium text-white">
          {formatMoney(row.amount)}
        </span>
      ),
    },
    {
      key: "pct",
      header: "% of Total",
      sortable: true,
      accessor: (row) => row.pct,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-slate-400">
          {formatPercent(row.pct, 1)}
        </span>
      ),
    },
    {
      key: "vsPriorPct",
      header: `vs ${data.comparisonLabel}`,
      sortable: true,
      accessor: (row) => row.vsPriorPct,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => <VsPriorCell row={row} />,
    },
    {
      key: "ytd",
      header: `YTD (${data.year})`,
      sortable: true,
      accessor: (row) => row.ytd,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatMoney(row.ytd)}
        </span>
      ),
    },
    {
      key: "avgMonthly",
      header: "Avg. Monthly",
      sortable: true,
      accessor: (row) => row.avgMonthly,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatMoney(row.avgMonthly)}
        </span>
      ),
    },
    {
      key: "sparkline",
      header: "Trend (Last 6 Months)",
      sortable: false,
      accessor: (row) => row.sparkline[row.sparkline.length - 1] ?? 0,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => <TrendSparkline values={row.sparkline} color={row.color} />,
    },
  ];

  return (
    <CardShell>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          EXPENSES BY CATEGORY
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[160px] text-[11px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Categories
              </SelectItem>
              {data.categoryOptions.map((category) => (
                <SelectItem key={category} value={category} className="text-[11px]">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger theme="dark" className="h-8 w-[160px] text-[11px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Departments
              </SelectItem>
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

      <DataTable
        columns={columns}
        data={filteredCategories}
        rowKey="id"
        loading={loading}
        Total
        TotalColumns={[1, 2, 4, 5]}
        totalRowLabel="Total Expenses"
        totalColumnClassNames={{
          1: "text-blue-400",
        }}
        emptyMessage="No expense categories match your filters."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        <span>All amounts are in USD</span>
        <span>Data as of {data.dataAsOf}</span>
      </div>
    </CardShell>
  );
}
