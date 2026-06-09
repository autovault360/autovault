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
import { Card } from "@/components/ui/card";
import { formatCompactCurrency, type DealerPlTrendPoint } from "@/lib/dealer/profit-loss/types";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";

type Props = {
  data: DealerPlTrendPoint[];
};

const SERIES = [
  { key: "revenue" as const, label: "Revenue", color: "#3b82f6" },
  { key: "grossProfit" as const, label: "Gross Profit", color: "#10b981" },
  { key: "expenses" as const, label: "Expenses", color: "#ef4444" },
  { key: "netProfit" as const, label: "Net Profit", color: "#a855f7" },
];

function OverviewTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-slate-700 bg-[#0e1626] px-3 py-2 text-[11px] shadow-lg">
      <div className="mb-1.5 font-medium text-slate-400">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const series = SERIES.find((s) => s.key === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>{series?.label ?? entry.dataKey}</span>
              <span className="font-semibold tabular-nums text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfitLossOverviewChart({ data }: Props) {
  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Profit & Loss Overview
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
            domain={[0, "auto"]}
          />
          <Tooltip content={<OverviewTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, color: "#94a3b8", paddingBottom: 8 }}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              dot={{ fill: series.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 5, fill: series.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
