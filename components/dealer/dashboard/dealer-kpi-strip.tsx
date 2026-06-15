"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import type { DealerKpi } from "@/lib/dealer/dashboard/types";

const CARD_COUNT = 7;

export default function DealerKpiStrip({
  kpis,
  loading,
}: {
  kpis: DealerKpi[];
  loading?: boolean;
}) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.label}
          data={kpi}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
