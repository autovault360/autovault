"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";

export default function KPISection({ kpis }: { kpis: KPICardData[] }) {
  return (
    <section className="mb-3.5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={kpi}
            showSparkline={false}
            showLink={false}
            deltaColor={
              kpi.label === "Total Expenses" ? "red" : "green"
            }
            className={ADMIN_PANEL_SHELL_CLASS}
          />
        ))}
      </div>
    </section>
  );
}
