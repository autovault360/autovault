"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

export default function KPISection({ kpis }: { kpis: KPICardData[] }) {
  return (
    <section className="mb-3.5">
      <div className={kpiGridClass(kpis.length)}>
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={kpi}
            {...KPI_CARD_DEFAULT_PROPS}
            deltaColor={kpi.label === "Total Expenses" ? "red" : "green"}
            className={KPI_CARD_SHELL_CLASS}
          />
        ))}
      </div>
    </section>
  );
}
