import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import {
  buildDocumentsStatsCards,
  type WholesaleDocumentStats,
} from "@/lib/dealer/documents/types";
import { cn } from "@/lib/utils";

const CARD_COUNT = 4;

export default function DocumentsStatsCards({
  stats,
}: {
  stats: WholesaleDocumentStats;
}) {
  const cards = buildDocumentsStatsCards(stats);

  return (
    <section className={cn(kpiGridClass(CARD_COUNT), "gap-2.5")}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          className={cn(KPI_CARD_SHELL_CLASS, "min-h-[108px]")}
        />
      ))}
    </section>
  );
}
