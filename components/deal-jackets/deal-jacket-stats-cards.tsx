import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { formatCurrency, type DealJacketStats } from "@/lib/deal-jackets/types";

function buildCards(stats: DealJacketStats) {
  return [
    {
      icon: "car" as const,
      color: "blue" as const,
      label: "Total Deal Jackets",
      value: String(stats.totalJackets),
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "",
    },
    {
      icon: "dollar-sign" as const,
      color: "green" as const,
      label: "Total Sale Value",
      value: formatCurrency(stats.totalSaleValue),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "",
    },
    {
      icon: "bar-chart-3" as const,
      color: "violet" as const,
      label: "Total Profit",
      value: formatCurrency(stats.totalProfit),
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: "",
    },
    {
      icon: "circle-alert" as const,
      color: "orange" as const,
      label: "Pending Review",
      value: String(stats.pendingReview),
      link: "",
      sparkColor: "#f97316",
      sparkPoints: "",
    },
    {
      icon: "badge-check" as const,
      color: "green" as const,
      label: "Approved",
      value: String(stats.approved),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "",
    },
  ];
}

export default function DealJacketStatsCards({
  stats,
}: {
  stats: DealJacketStats;
}) {
  const cards = buildCards(stats);

  return (
    <section className="mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
