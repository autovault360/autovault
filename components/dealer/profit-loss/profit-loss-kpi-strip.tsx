import { KPICard } from "@/components/ui/kpi-card";
import type { KPICardData } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import {
  buildDealerProfitLossKpiCards,
  type DealerPlKpiCard,
  type DealerPlKpiStats,
} from "@/lib/dealer/profit-loss/types";

function toKpiCardData(card: DealerPlKpiCard): KPICardData {
  return {
    icon: card.icon,
    color: card.color,
    label: card.label,
    value: card.value,
    delta: card.delta,
    trend: card.trend,
    link: card.link,
    sparkColor: card.sparkColor,
    sparkPoints: card.sparkPoints,
  };
}

export default function ProfitLossKpiStrip({
  kpis,
  className,
}: {
  kpis: DealerPlKpiStats;
  className?: string;
}) {
  const cards = buildDealerProfitLossKpiCards(kpis);

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={toKpiCardData(card)}
          layout="accent-top"
          showSparkline={false}
          showLink={false}
        />
      ))}
    </div>
  );
}
