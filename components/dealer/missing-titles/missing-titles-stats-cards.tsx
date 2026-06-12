import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
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
    <section className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={{ ...card, link: card.link }}
          showLink={false}
          showSparkline={false}
          deltaColor={card.deltaColor ?? "green"}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
