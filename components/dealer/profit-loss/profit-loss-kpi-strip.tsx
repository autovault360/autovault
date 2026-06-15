import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import {
  buildDealerProfitLossKpiCards,
  type DealerPlKpiStats,
} from "@/lib/dealer/profit-loss/types";

const CARD_COUNT = 5;

export default function ProfitLossKpiStrip({ kpis }: { kpis: DealerPlKpiStats }) {
  const cards = buildDealerProfitLossKpiCards(kpis);

  return (
    <section className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          deltaColor={card.deltaColor ?? "green"}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
