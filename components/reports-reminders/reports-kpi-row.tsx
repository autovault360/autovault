"use client";

import { KPICard } from "@/components/ui/kpi-card";
import type { ReportsKpi } from "@/lib/reports-reminders/types";

type Props = {
  kpis: ReportsKpi[];
};

export default function ReportsKpiRow({ kpis }: Props) {
  return (
    <section className="mb-3.5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={{
              ...kpi,
              link: "",
              unit: undefined,
            }}
            showLink={false}
            deltaColor={kpi.label === "Total Expenses" ? "red" : "green"}
            className="min-w-0"
          />
        ))}
      </div>
    </section>
  );
}
