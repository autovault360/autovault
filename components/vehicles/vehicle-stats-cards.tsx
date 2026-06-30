import { KPICard } from "@/components/ui/kpi-card";
import {
  buildInventoryKpiCards,
  computeInventoryStats,
  type InventoryVehicle,
} from "@/lib/vehicles/inventory-calculations";
import {
  CommissionOverviewKpiCard,
  SoldThisMonthKpiCard,
  TitlesKpiCard,
} from "@/components/vehicles/inventory-kpi-variants";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

const CARD_COUNT = 9;

export default function VehicleStatsCards({
  vehicles,
}: {
  vehicles: InventoryVehicle[];
}) {
  const stats = computeInventoryStats(vehicles);
  const cards = buildInventoryKpiCards(stats);

  const standardIndices = [0, 1, 2, 3, 4, 5];

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {standardIndices.map((index) => (
        <KPICard
          key={cards[index]!.label}
          data={cards[index]!}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
          deltaClassName={index === 0 ? "text-slate-500" : undefined}
        />
      ))}
      <CommissionOverviewKpiCard
        avgRate={stats.avgCommissionRate}
        totalCommissions={cards[6]!.periodMetrics?.[0]?.value ?? "$0"}
      />
      <TitlesKpiCard missing={stats.missingTitles} titlesIn={stats.titlesIn} />
      <SoldThisMonthKpiCard
        soldCount={stats.soldThisMonthCount}
        profit={cards[8]!.periodMetrics?.[0]?.value ?? "$0"}
        roi={cards[8]!.periodMetrics?.[1]?.value ?? "0%"}
      />
    </section>
  );
}
