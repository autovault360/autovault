import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  formatCurrency,
  type SalesRepStats,
} from "@/lib/sales-reps/types";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

const CARD_COUNT = 3;

function buildCards(stats: SalesRepStats): KPICardData[] {
  return [
    {
      icon: "users",
      color: "blue",
      label: "Total Sales Reps",
      value: String(stats.totalReps),
      delta: `${stats.activeReps} Active`,
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "",
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Commissions Paid Out (MTD)",
      value: formatCurrency(stats.commissionsPaidMtd),
      delta: stats.commissionsPaidMtdDelta,
      link: "",
      sparkColor: "#10b981",
      sparkPoints: stats.commissionsPaidMtdSparkPoints,
    },
    {
      icon: "bar-chart-3",
      color: "violet",
      label: "Total Commissions YTD",
      value: formatCurrency(stats.totalCommissionsYtd),
      delta: stats.totalCommissionsYtdDelta,
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: stats.totalCommissionsYtdSparkPoints,
    },
  ];
}

export default function SalesRepStatsCards({ stats }: { stats: SalesRepStats }) {
  const cards = buildCards(stats);

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {cards.map((card, i) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          deltaColor={
            i === 0
              ? "green"
              : i === 1
                ? stats.commissionsPaidMtdDeltaColor
                : stats.totalCommissionsYtdDeltaColor
          }
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
