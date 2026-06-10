"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatCompactCurrency, formatCurrency } from "@/lib/profit-loss/types";

type LineDataPoint = {
  label: string;
  units: number;
  gross?: number;
  commission?: number;
};

type LineConfig = {
  key: "units" | "gross" | "commission";
  color: string;
  yAxisId?: string;
  name: string;
};

type LineChartProps = {
  data: LineDataPoint[];
  lines: LineConfig[];
  title: string;
  height?: number;
};

function LineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-700 bg-card px-3 py-2 text-[11px] shadow-lg">
      <div className="mb-1 text-slate-400">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name.includes("Units") ? p.value : formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
}

export function CalendarMetricLineChart({
  data,
  lines,
  title,
  height = 200,
}: LineChartProps) {
  const hasDualAxis = lines.some((l) => l.yAxisId === "right");

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          {hasDualAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
          )}
          <Tooltip content={<LineTooltip />} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              yAxisId={line.yAxisId ?? "left"}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

type BarChartProps = {
  data: { quarter: string; value: number }[];
  title: string;
  barColor: string;
  valueFormatter?: (n: number) => string;
  height?: number;
};

function BarTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
  formatter: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-700 bg-card px-3 py-2 text-[11px] shadow-lg">
      <div className="text-slate-400">{String(label ?? "")}</div>
      <div className="font-semibold text-white">{formatter(payload[0]!.value)}</div>
    </div>
  );
}

export function QuarterlyPerformanceBarChart({
  data,
  title,
  barColor,
  valueFormatter = (n) => String(n),
  height = 180,
}: BarChartProps) {
  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="quarter"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => (v >= 1000 ? formatCompactCurrency(v) : String(v))}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <BarTooltip
                active={active}
                payload={payload as unknown as Array<{ value: number }>}
                label={label}
                formatter={valueFormatter}
              />
            )}
          />
          <Bar dataKey="value" fill={barColor} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

type AreaChartProps = {
  data: { label: string; commission: number }[];
  title: string;
  height?: number;
};

export function CalendarCommissionsAreaChart({
  data,
  title,
  height = 180,
}: AreaChartProps) {
  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="commissionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => formatCompactCurrency(v)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-md border border-slate-700 bg-card px-3 py-2 text-[11px]">
                  <div className="text-slate-400">{label}</div>
                  <div className="font-semibold text-purple-400">
                    {formatCurrency(payload[0]!.value as number)}
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="commission"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#commissionFill)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
