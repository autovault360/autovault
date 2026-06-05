import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency, type VehicleStats } from "@/lib/vehicles/types";

function buildCards(stats: VehicleStats) {
  return [
    {
      icon: "car" as const,
      color: "blue",
      label: "Total Inventory",
      value: String(stats.totalInventory),
      unit: "Vehicles",
      link: "View Inventory",
      sparkColor: "#3b82f6",
      sparkPoints:
        "0,40 25,32 50,34 75,28 100,30 125,22 150,24 175,16 200,18 220,10",
    },
    {
      icon: "leaf" as const,
      color: "green",
      label: "New Arrivals",
      value: String(stats.newArrivals),
      unit: "This Month",
      link: "View New Arrivals",
      sparkColor: "#10b981",
      sparkPoints:
        "0,38 25,30 50,32 75,26 100,28 125,20 150,22 175,14 200,16 220,8",
    },
    {
      icon: "bar-chart-3" as const,
      color: "violet",
      label: "Aged Units Over 25 Days",
      value: String(stats.agedUnits),
      unit: "Units",
      link: "View Aging Report",
      sparkColor: "#a855f7",
      sparkPoints:
        "0,36 25,34 50,30 75,28 100,26 125,22 150,20 175,18 200,14 220,10",
    },
    {
      icon: "dollar-sign" as const,
      color: "orange",
      label: "Total Inventory Value",
      value: formatCurrency(stats.totalValue),
      delta: "... 7.6% vs last month",
      link: "View Valuation Report",
      sparkColor: "#f97316",
      sparkPoints:
        "0,40 25,34 50,30 75,28 100,24 125,22 150,18 175,16 200,12 220,8",
    },
    {
      icon: "tag" as const,
      color: "red",
      label: "Marked Sold",
      value: String(stats.markedSold),
      unit: "This Month",
      link: "View Sold Vehicles",
      sparkColor: "#ef4444",
      sparkPoints:
        "0,38 25,32 50,30 75,26 100,24 125,20 150,18 175,14 200,12 220,8",
    },
  ];
}

export default function VehicleStatsCards({ stats }: { stats: VehicleStats }) {
  const cards = buildCards(stats);

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard key={card.label} data={card} />
      ))}
    </section>
  );
}
