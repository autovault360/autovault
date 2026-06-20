"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import type {
  CpaExpenseCategoryRow,
  CpaExpensesTrendPoint,
} from "@/lib/cpa/expenses/types";
import { formatMoney } from "@/components/cpa/dashboard/cpa-dashboard-utils";
import { cn } from "@/lib/utils";

const CHART_CARD_CLASS =
  "flex h-full min-h-[320px] flex-col rounded-lg border-slate-800 bg-card p-4 shadow-none";

function formatAxisMoney(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

function ExpenseBreakdownPanel({
  categories,
  total,
}: {
  categories: CpaExpenseCategoryRow[];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const segments = categories.filter((c) => c.amount > 0);

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="EXPENSE BREAKDOWN" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center">
        <ul className="min-w-0 flex-1 space-y-2">
          {categories.map((segment) => (
            <li
              key={segment.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 text-[11px] border-b border-slate-800 pb-1.5"
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-slate-400">{segment.label}</span>
              <span className="tabular-nums text-slate-300">
                {formatMoney(segment.amount)}
              </span>
              <span className="w-11 text-right font-medium tabular-nums text-white">
                {segment.pct.toFixed(1)}%
              </span>
            </li>
          ))}
          <li className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 text-[11px] font-semibold">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-500" />
            <span className="text-violet-400">Total Expenses</span>
            <span className="tabular-nums text-white">{formatMoney(total)}</span>
            <span className="w-11 text-right tabular-nums text-white">100%</span>
          </li>
        </ul>
        <div className="relative mx-auto h-[148px] w-[148px] shrink-0 lg:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments.length > 0 ? segments : [{ id: "empty", label: "None", amount: 1, color: "#334155", pct: 0, vsPriorPct: 0, vsPriorDirection: "flat" as const, ytd: 0, avgMonthly: 0, sparkline: [] }]}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                dataKey="amount"
                nameKey="label"
                stroke="none"
                paddingAngle={1}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {(segments.length > 0 ? segments : [{ id: "empty", label: "None", amount: 1, color: "#334155" }]).map(
                  (segment, index) => (
                    <Cell
                      key={segment.id ?? segment.label}
                      fill={segment.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                    />
                  ),
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0e1626",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => formatMoney(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[16px] font-bold tabular-nums text-violet-400">
              {formatMoney(total)}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">Total Expenses</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ExpensesTrendPanel({ data }: { data: CpaExpensesTrendPoint[] }) {
  const maxExpense = Math.max(...data.map((d) => d.expenses), 1);
  const axisMax = Math.ceil(maxExpense / 50_000) * 50_000 || 200_000;

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="EXPENSES TREND" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[220px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                domain={[0, axisMax]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisMoney}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: "#0e1626",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => formatMoney(Number(value))}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }}
                name="2026 Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Expenses
          </span>
        </div>
      </div>
    </CardShell>
  );
}

function ExpensesByCategoryPanel({
  categories,
}: {
  categories: CpaExpenseCategoryRow[];
}) {
  const rows = categories.filter((c) => c.amount > 0);
  const maxAmount = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <CardShell className={CHART_CARD_CLASS}>
      <CardHead title="EXPENSES BY CATEGORY" />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-slate-500">
            No expense data for this period.
          </p>
        ) : (
          rows.map((row) => {
            const barWidth = (row.amount / maxAmount) * 100;
            return (
              <div key={row.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-slate-300">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {formatMoney(row.amount)}{" "}
                    <span className="text-slate-500">({row.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/90">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </CardShell>
  );
}

export default function CpaExpensesChartsRow({
  categories,
  breakdownTotal,
  trend,
}: {
  categories: CpaExpenseCategoryRow[];
  breakdownTotal: number;
  trend: CpaExpensesTrendPoint[];
}) {
  return (
    <div className={cn("mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch")}>
      <ExpenseBreakdownPanel categories={categories} total={breakdownTotal} />
      <ExpensesTrendPanel data={trend} />
      <ExpensesByCategoryPanel categories={categories} />
    </div>
  );
}
