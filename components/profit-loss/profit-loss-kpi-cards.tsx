"use client";

import { KPICard } from "@/components/ui/kpi-card";
import type { KPICardData } from "@/components/ui/kpi-card";
import type { PlKpiMetric } from "@/lib/profit-loss/types";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

const iconMap: Record<PlKpiMetric["iconColor"], KPICardData["icon"]> = {
  green: "dollar-sign",
  red: "trending-down",
  purple: "shopping-cart",
  orange: "tag",
  blue: "dollar-sign",
  teal: "percent",
};

const colorMap: Record<PlKpiMetric["iconColor"], KPICardData["color"]> = {
  green: "green",
  red: "red",
  purple: "violet",
  orange: "orange",
  blue: "blue",
  teal: "teal",
};

function toKpiCardData(kpi: PlKpiMetric): KPICardData {
  return {
    icon: iconMap[kpi.iconColor],
    color: colorMap[kpi.iconColor],
    label: kpi.label,
    value: kpi.valueFormatted,
    delta: kpi.delta,
    link: "",
    sparkColor: "",
    sparkPoints: "",
  };
}

type Props = {
  kpis: PlKpiMetric[];
};

export default function ProfitLossKPICards({ kpis }: Props) {
  return (
    <section className={kpiGridClass(kpis.length, "mb-3.5")}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          data={toKpiCardData(kpi)}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
