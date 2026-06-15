import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency, type VehicleStats } from "@/lib/vehicles/types";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

const CARD_COUNT = 5;

function buildCards(stats: VehicleStats) {
  return [
    {
      icon: "car" as const,
      color: "blue",
      label: "Total Inventory",
      value: String(stats.totalInventory),
      unit: "Vehicles",
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "",
    },
    {
      icon: "leaf" as const,
      color: "green",
      label: "New Arrivals",
      value: String(stats.newArrivals),
      unit: "This Month",
      link: "",
      sparkColor: "#10b981",
      sparkPoints: "",
    },
    {
      icon: "bar-chart-3" as const,
      color: "violet",
      label: "Aged Units Over 25 Days",
      value: String(stats.agedUnits),
      unit: "Units",
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: "",
    },
    {
      icon: "dollar-sign" as const,
      color: "orange",
      label: "Total Inventory Value",
      value: formatCurrency(stats.totalValue),
      delta: "... 7.6% vs last month",
      link: "",
      sparkColor: "#f97316",
      sparkPoints: "",
    },
    {
      icon: "tag" as const,
      color: "red",
      label: "Marked Sold",
      value: String(stats.markedSold),
      unit: "This Month",
      link: "",
      sparkColor: "#ef4444",
      sparkPoints: "",
    },
  ];
}

export default function VehicleStatsCards({ stats }: { stats: VehicleStats }) {
  const cards = buildCards(stats);

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
