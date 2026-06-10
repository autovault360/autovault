"use client";

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlTrendPoint } from "@/lib/profit-loss/types";
import { formatCompactCurrency, formatCurrency } from "@/lib/profit-loss/types";

type Props = {
  data: PlTrendPoint[];
  title?: string;
  height?: number;
  showPeriodSelect?: boolean;
  periodValue?: string;
  onPeriodChange?: (value: string) => void;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: PlTrendPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!;
  return (
    <div className="rounded-md border border-slate-700 bg-card px-3 py-2 text-[11px] shadow-lg">
      <div className="text-slate-400">{point.payload.label}</div>
      <div className="font-semibold text-emerald-400">
        {formatCurrency(point.value)}
      </div>
    </div>
  );
}

export default function ProfitLossCharts({
  data,
  title = "Monthly Trend (Net Profit)",
  height = 220,
  showPeriodSelect = true,
  periodValue = "this_month",
  onPeriodChange,
}: Props) {
  return (
    <Card className="rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </h3>
        {showPeriodSelect && (
          <Select value={periodValue} onValueChange={onPeriodChange}>
            <SelectTrigger
              theme="dark"
              className="w-auto"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-card text-slate-300">
              <SelectGroup>
                <SelectLabel className="text-[11px] text-slate-400">Period</SelectLabel>
                <SelectItem value="this_month" className="text-[11px]">
                  This Month
                </SelectItem>
                <SelectItem value="last_month" className="text-[11px]">
                  Last Month
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netProfitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netProfit"
            stroke="none"
            fill="url(#netProfitFill)"
          />
          <Line
            type="monotone"
            dataKey="netProfit"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#10B981", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 5, fill: "#10B981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
