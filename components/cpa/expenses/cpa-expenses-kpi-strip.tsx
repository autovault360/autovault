"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import type { CpaExpensesKpi } from "@/lib/cpa/expenses/types";

const SPARK_POINTS =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

const deltaColorClass: Record<
  NonNullable<CpaExpensesKpi["deltaColor"]>,
  string
> = {
  green: "text-emerald-400",
  red: "text-red-400",
  blue: "text-blue-400",
  orange: "text-orange-400",
  teal: "text-teal-400",
  violet: "text-violet-400",
  neutral: "text-slate-500",
};

function toKpiCardData(kpi: CpaExpensesKpi): KPICardData {
  return {
    icon: kpi.icon,
    color: kpi.color,
    label: kpi.label,
    value: kpi.value,
    delta: kpi.delta,
    link: "",
    sparkColor: "#3b82f6",
    sparkPoints: SPARK_POINTS,
  };
}

export default function CpaExpensesKpiStrip({ kpis }: { kpis: CpaExpensesKpi[] }) {
  return (
    <div className={kpiGridClass(kpis.length, "mb-4")}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          data={toKpiCardData(kpi)}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
          valueClassName={
            kpi.id === "highest-category" || kpi.id === "lowest-category"
              ? "text-[15px] leading-tight"
              : undefined
          }
          deltaClassName={
            kpi.deltaColor ? deltaColorClass[kpi.deltaColor] : undefined
          }
        />
      ))}
    </div>
  );
}
