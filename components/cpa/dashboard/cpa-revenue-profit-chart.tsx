"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { CpaTrendPoint } from "@/lib/cpa/types";

export default function CpaRevenueProfitChart({ data, bare }: { data: CpaTrendPoint[]; bare?: boolean }) {
  const chart = (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#0e1626", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
          <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} name="Revenue" />
          <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (bare) return chart;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">REVENUE &amp; PROFIT TREND</h3>
      {chart}
    </Card>
  );
}
