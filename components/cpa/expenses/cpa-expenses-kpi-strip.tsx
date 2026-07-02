"use client";

import StatKpiCard from "@/components/ui/stat-kpi-card";
import type { CpaExpensesKpi } from "@/lib/cpa/expenses/types";

const COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  emerald: "#10b981",
  purple: "#a07bff",
  orange: "#ff9f43",
  red: "#ef4444",
  violet: "#a07bff",
  teal: "#14b8a6",
};

export default function CpaExpensesKpiStrip({ kpis }: { kpis: CpaExpensesKpi[] }) {
  return (
    <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      {kpis.map((kpi) => (
        <StatKpiCard
          key={kpi.id}
          kpiKey={kpi.id}
          accent={COLOR_MAP[kpi.color] ?? "#3b82f6"}
          defaultAccent={COLOR_MAP[kpi.color] ?? "#3b82f6"}
          label={kpi.label}
          value={kpi.value}
          footer={kpi.delta ?? ""}
        />
      ))}
    </section>
  );
}
