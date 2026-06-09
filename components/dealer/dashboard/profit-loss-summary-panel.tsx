"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import type { ProfitLossPoint } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const DEFAULT_SHELL_CLASS =
  "min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm";

export default function ProfitLossSummaryPanel({
  data,
  summary,
  loading,
  shellClassName,
}: {
  data: ProfitLossPoint[];
  summary: { totalRevenue: number; totalExpenses: number; netProfit: number };
  loading?: boolean;
  shellClassName?: string;
}) {
  const shellClass = cn(DEFAULT_SHELL_CLASS, shellClassName);

  if (loading) {
    return (
      <CardShell className={shellClass}>
        <SkeletonBar className="mb-3 h-3 w-40" />
        <SkeletonBar className="h-40 w-full" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <SkeletonBar className="h-12" />
          <SkeletonBar className="h-12" />
          <SkeletonBar className="h-12" />
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell className={shellClass}>
      <CardHead title="PROFIT & LOSS SUMMARY" pill="This Month" />
      <div className="h-44 min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#0a101d",
                border: "1px solid #1e293b",
                borderRadius: 6,
                fontSize: 11,
              }}
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "revenue" ? "Revenue" : "Expenses",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "#64748b" }}
              formatter={(value) =>
                value === "revenue" ? "Revenue" : "Expenses"
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: "#ef4444" }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#1e293b] pt-3">
        <div>
          <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
            TOTAL REVENUE
          </div>
          <div className="text-[15px] font-bold tabular-nums text-emerald-400">
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
            TOTAL EXPENSES
          </div>
          <div className="text-[15px] font-bold tabular-nums text-red-400">
            {formatCurrency(summary.totalExpenses)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
            NET PROFIT
          </div>
          <div className="text-[15px] font-bold tabular-nums text-white">
            {formatCurrency(summary.netProfit)}
          </div>
        </div>
      </div>
    </CardShell>
  );
}
