import { KPICard, type KPICardData, type KPIPeriodMetric } from "@/components/ui/kpi-card";
import type { SalesRepProfileKpiMetric } from "@/lib/sales-reps/profile-types";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";

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
    <section className="mb-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((metric) => (
        <KPICard
          key={metric.id}
          data={toKpiCardData(metric)}
          layout="period"
          showSparkline={false}
          showLink={false}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
