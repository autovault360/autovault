import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import {
  buildMissingTitlesStatsCards,
  type MissingTitlesStats,
} from "@/lib/dealer/missing-titles/types";

const CARD_COUNT = 5;

export default function MissingTitlesStatsCards({
  stats,
}: {
  stats: MissingTitlesStats;
}) {
  const cards = buildMissingTitlesStatsCards(stats);

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={{ ...card, link: card.link }}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
