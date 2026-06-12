"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import type { ReportsKpi } from "@/lib/reports-reminders/types";

type Props = {
  kpis: ReportsKpi[];
};

export default function ReportsKpiRow({ kpis }: Props) {
  return (
    <section className="mb-3.5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={{
              ...kpi,
              link: "",
              unit: undefined,
            }}
            showLink={false}
            showSparkline={false}
            deltaColor={kpi.label === "Total Expenses" ? "red" : "green"}
            className="min-w-0"
          />
        ))}
      </div>
    </section>
  );
}
