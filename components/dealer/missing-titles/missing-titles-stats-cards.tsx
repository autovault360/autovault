import { KPICard } from "@/components/ui/kpi-card";
import {
  buildMissingTitlesStatsCards,
  type MissingTitlesStats,
} from "@/lib/dealer/missing-titles/types";

export default function MissingTitlesStatsCards({
  stats,
}: {
  stats: MissingTitlesStats;
}) {
  const cards = buildMissingTitlesStatsCards(stats);

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={{ ...card, link: card.link }}
          showLink={false}
          showSparkline={false}
          deltaColor={card.deltaColor ?? "green"}
          className="shadow-[0_0_0_1px_rgba(148,163,184,0.08)]"
        />
      ))}
    </section>
  );
}
