"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import type { CpaVehicleLossesKpi } from "@/lib/cpa/vehicle-losses-report/types";

const SPARK_POINTS =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

function toKpiCardData(kpi: CpaVehicleLossesKpi): KPICardData {
  return {
    icon: kpi.icon,
    color: kpi.color,
    label: kpi.label,
    value: kpi.value,
    unit: kpi.subtext,
    link: "",
    sparkColor: kpi.color === "red" ? "#ef4444" : "#f97316",
    sparkPoints: SPARK_POINTS,
  };
}

export default function CpaVehicleLossesReportKpiStrip({
  kpis,
}: {
  kpis: CpaVehicleLossesKpi[];
}) {
  return (
    <div className={kpiGridClass(kpis.length, "mb-4")}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          data={toKpiCardData(kpi)}
          {...KPI_CARD_DEFAULT_PROPS}
          deltaColor="red"
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
