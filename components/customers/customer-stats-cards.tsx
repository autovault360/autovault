import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency, type CustomerStats } from "@/lib/customers/types";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

const CARD_COUNT = 4;

function buildCards(stats: CustomerStats) {
  return [
    {
      icon: "users" as const,
      color: "blue",
      label: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      delta: stats.totalCustomersDelta,
      deltaColor: stats.totalCustomersDeltaColor,
      link: "View All",
      sparkColor: "#3b82f6",
      sparkPoints: "0,40 55,28 110,32 165,20 220,12",
    },
    {
      icon: "user-plus" as const,
      color: "green",
      label: "New Customers (MTD)",
      value: String(stats.newCustomersMtd),
      delta: stats.newCustomersDelta,
      deltaColor: stats.newCustomersDeltaColor,
      link: "View New",
      sparkColor: "#10b981",
      sparkPoints: "0,38 55,26 110,30 165,18 220,10",
    },
    {
      icon: "handshake" as const,
      color: "violet",
      label: "Active Deals",
      value: String(stats.activeDeals),
      delta: stats.activeDealsDelta,
      deltaColor: stats.activeDealsDeltaColor,
      link: "View Pipeline",
      sparkColor: "#a855f7",
      sparkPoints: "0,20 55,28 110,24 165,32 220,36",
    },
    {
      icon: "dollar-sign" as const,
      color: "orange",
      label: "Total Sales (MTD)",
      value: formatCurrency(stats.totalSalesMtd),
      delta: stats.totalSalesDelta,
      deltaColor: stats.totalSalesDeltaColor,
      link: "View Sales",
      sparkColor: "#f97316",
      sparkPoints: "0,40 55,32 110,28 165,20 220,8",
    },
  ];
}

export default function CustomerStatsCards({
  stats,
}: {
  stats: CustomerStats;
}) {
  const cards = buildCards(stats);

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          deltaColor={card.deltaColor}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
