"use client";

import { KPICard } from "@/components/ui/kpi-card";
import type { KPICardData } from "@/components/ui/kpi-card";
import type { PlKpiMetric } from "@/lib/profit-loss/types";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";

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
    <section className="mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          data={toKpiCardData(kpi)}
          showSparkline={false}
          showLink={false}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
