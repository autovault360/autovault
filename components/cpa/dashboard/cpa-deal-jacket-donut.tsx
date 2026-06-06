"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaDealJacketSegment } from "@/lib/cpa/types";

export default function CpaDealJacketDonut({
  segments,
  total,
  bare,
}: {
  segments: CpaDealJacketSegment[];
  total: number;
  bare?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const content = (
    <div className="flex items-center gap-4">
      <div className="relative h-36 w-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {segments.map((s, i) => (
                <Cell
                  key={s.name}
                  fill={s.color}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0e1626", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#94a3b8" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-white">{total}</div>
          <div className="text-[9px] text-slate-500">Total Deals</div>
        </div>
      </div>
      <ul className="space-y-1.5">
          {segments.map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300">{s.name}</span>
            <span className="ml-auto font-medium text-white tabular-nums">
              {s.count != null ? `${s.count} | ${s.value}%` : `${s.value}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">DEAL JACKETS BY STATUS</h3>
      {content}
    </Card>
  );
}
