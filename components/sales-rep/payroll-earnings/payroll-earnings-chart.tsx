"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { EarningsChartRange } from "@/lib/sales-rep/payroll-earnings/types";

type Props = {
  data: { label: string; earnings: number }[];
  range: EarningsChartRange;
  onRangeChange: (range: EarningsChartRange) => void;
  loading?: boolean;
};

const RANGES: { id: EarningsChartRange; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export default function PayrollEarningsChart({
  data,
  range,
  onRangeChange,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="h-[180px] animate-pulse rounded-sm border border-slate-700 bg-slate-800/30" />
    );
  }

  const chartData =
    range === "yearly"
      ? data
      : range === "monthly"
        ? data.slice(-3)
        : data.slice(-2);

  return (
    <div className="rounded-sm border border-slate-700/80 bg-card p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[12px] font-semibold text-white">
            Earnings Overview
          </h3>
          <p className="text-[10px] text-slate-500">
            Commission growth trend
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-slate-700/80 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onRangeChange(r.id)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium transition",
                range === r.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
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
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 4,
                fontSize: 11,
                color: "#e2e8f0",
              }}
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Earnings",
              ]}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#earnGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
