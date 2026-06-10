"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportCardShell } from "@/components/reports-reminders/report-card-primitives";
import { formatCurrency } from "@/lib/sales-reps/types";
import type {
  SalesRepTrendPoint,
  SalesRepTrendSummary,
} from "@/lib/sales-reps/profile-types";

type Props = {
  data: SalesRepTrendPoint[];
  summary: SalesRepTrendSummary;
};

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-700 bg-card px-3 py-2 text-[11px] shadow-lg">
      <div className="mb-1 text-slate-400">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="font-medium" style={{ color: entry.color }}>
          {entry.name}:{" "}
          {entry.name === "Vehicles Sold"
            ? entry.value
            : formatCurrency(entry.value)}
        </div>
      ))}
    </div>
  );
}

export default function SalesRepSalesTrendChart({ data, summary }: Props) {
  return (
    <ReportCardShell className="flex h-full flex-col">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
        Sales Trend{" "}
        <span className="font-semibold normal-case tracking-normal text-slate-500">
          (Last 12 Months)
        </span>
      </h2>
      <div className="min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "#94a3b8", paddingTop: 8 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="vehiclesSold"
              name="Vehicles Sold"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="grossProfit"
              name="Gross Profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="commissions"
              name="Commissions"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: "#a855f7", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800/60 pt-2.5 text-[13px]">
        <span>
          <span className="text-slate-500">Total Vehicles: </span>
          <span className="font-semibold text-white">{summary.totalVehicles}</span>
        </span>
        <span>
          <span className="text-slate-500">Total Gross Profit: </span>
          <span className="font-semibold text-emerald-400">
            {formatCurrency(summary.totalGrossProfit)}
          </span>
        </span>
        <span>
          <span className="text-slate-500">Total Commissions: </span>
          <span className="font-semibold text-purple-400">
            {formatCurrency(summary.totalCommissions)}
          </span>
        </span>
      </div>
    </ReportCardShell>
  );
}