"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import type { ReportsKpi } from "@/lib/reports-reminders/types";

type Props = {
  kpis: ReportsKpi[];
};

export default function ReportsKpiRow({ kpis }: Props) {
  return (
    <section className="mb-3.5">
      <div className={kpiGridClass(kpis.length)}>
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={{
              ...kpi,
              link: "",
              unit: undefined,
            }}
            {...KPI_CARD_DEFAULT_PROPS}
            deltaColor={kpi.label === "Total Expenses" ? "red" : "green"}
            className={KPI_CARD_SHELL_CLASS}
          />
        ))}
      </div>
    </section>
  );
}
