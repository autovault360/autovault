"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import type { ReportsDrilldownType, ReportsKpi } from "@/lib/reports-reminders/types";

type Props = {
  kpis: ReportsKpi[];
  onOpen: (type: ReportsDrilldownType) => void;
};

export default function ReportsKpiRow({ kpis, onOpen }: Props) {
  return (
    <section className="mb-3.5">
      <div className={kpiGridClass(kpis.length)}>
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => kpi.id && onOpen(kpi.id)}
            className="min-w-0 text-left"
          >
            <KPICard
              data={{
                ...kpi,
                link: "View Details",
                unit: undefined,
              }}
              {...KPI_CARD_DEFAULT_PROPS}
              showLink={false}
              deltaColor={kpi.label === "Total Expenses" ? "red" : "green"}
              className={KPI_CARD_SHELL_CLASS}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
