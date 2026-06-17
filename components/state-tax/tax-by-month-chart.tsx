"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { MonthlyTaxDataPoint } from "@/lib/state-tax/types";

type Props = {
  data: MonthlyTaxDataPoint[];
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-[12px] font-bold text-white">{payload[0].name}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] text-slate-300">
          {i === 0 ? "Tax: " : "Vehicles: "}
          <span className="font-semibold text-white">
            {i === 0 ? formatCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function TaxByMonthChart({ data }: Props) {
  const hasData = data.some((d) => d.tax > 0);

  return (
    <Card className="flex h-full flex-col rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
      <h2 className="mb-3 text-[13px] font-bold text-white">
        Tax Entered by Month
      </h2>
      {hasData ? (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="tax"
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-[12px] text-slate-500">
            No tax data for this year yet
          </p>
        </div>
      )}
    </Card>
  );
}
