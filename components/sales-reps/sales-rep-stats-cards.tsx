import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  formatCurrency,
  type SalesRepStats,
} from "@/lib/sales-reps/types";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";

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
    <section className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-3">
      {cards.map((card, i) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          deltaColor={
            i === 0
              ? "green"
              : i === 1
                ? stats.commissionsPaidMtdDeltaColor
                : stats.totalCommissionsYtdDeltaColor
          }
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
