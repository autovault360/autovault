import { KPICard, type KPICardData, type KPIPeriodMetric } from "@/components/ui/kpi-card";
import type { SalesRepProfileKpiMetric } from "@/lib/sales-reps/profile-types";
import {
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

function toKpiCardData(metric: SalesRepProfileKpiMetric): KPICardData {
  const periodMetrics: KPIPeriodMetric[] = [];

  if (metric.thisYear) {
    periodMetrics.push({ value: metric.thisYear, label: "This Year" });
  }
  if (metric.lifetime) {
    periodMetrics.push({ value: metric.lifetime, label: "Lifetime" });
  }

  return {
    icon: metric.icon,
    color: metric.color,
    label: metric.label,
    value: metric.thisMonth,
    unit: "This Month",
    link: "",
    sparkColor: "",
    sparkPoints: "",
    periodMetrics,
  };
}

export default function SalesRepProfileKpiRow({
  kpis,
}: {
  kpis: SalesRepProfileKpiMetric[];
}) {
  return (
    <section className={kpiGridClass(kpis.length, "mb-3.5")}>
      {kpis.map((metric) => (
        <KPICard
          key={metric.id}
          data={toKpiCardData(metric)}
          layout="period"
          showSparkline={false}
          showLink={false}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
