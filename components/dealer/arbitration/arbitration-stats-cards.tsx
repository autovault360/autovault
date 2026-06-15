import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import {
  buildArbitrationStatsCards,
  type ArbitrationStats,
} from "@/lib/dealer/arbitration/types";

const CARD_COUNT = 5;

export default function ArbitrationStatsCards({
  stats,
}: {
  stats: ArbitrationStats;
}) {
  const cards = buildArbitrationStatsCards(stats);

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
