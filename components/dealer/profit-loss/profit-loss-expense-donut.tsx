"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import type { DealerPlExpenseSegment } from "@/lib/dealer/profit-loss/types";

type Props = {
  segments: DealerPlExpenseSegment[];
  total: number;
};

export default function ProfitLossExpenseDonut({ segments, total }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Expenses Breakdown
      </h3>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-44 w-44 shrink-0 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                dataKey="amount"
                stroke="none"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {segments.map((segment, i) => (
                  <Cell
                    key={segment.id}
                    fill={segment.color}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0e1626",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Amount",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Total Expenses
            </span>
            <span className="mt-0.5 text-lg font-bold tabular-nums text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-2">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-300">
                {segment.label}
              </span>
              <span className="shrink-0 tabular-nums text-slate-400">
                {segment.percent.toFixed(1)}%
              </span>
              <span className="w-[72px] shrink-0 text-right font-medium tabular-nums text-white">
                {formatCurrency(segment.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
