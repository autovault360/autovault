"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import type { SoldVehicleKpiStrip } from "@/lib/dealer/dashboard/types";

const CARD_COUNT = 6;

export default function SoldVehicleKpiStrip({
  kpis,
  loading,
}: {
  kpis: SoldVehicleKpiStrip;
  loading?: boolean;
}) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards = [
    { data: kpis.totalSold, layout: "default" as const },
    { data: kpis.totalSales, layout: "default" as const },
    { data: kpis.totalGrossProfit, layout: "default" as const },
    { data: kpis.averageGrossProfit, layout: "default" as const },
    { data: kpis.soldThisMonth, layout: "default" as const },
    { data: kpis.pendingPayments, layout: "period" as const },
  ];

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {cards.map(({ data, layout }) => (
        <KPICard
          key={data.label}
          data={data}
          layout={layout}
          showSparkline={false}
          showLink={false}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
