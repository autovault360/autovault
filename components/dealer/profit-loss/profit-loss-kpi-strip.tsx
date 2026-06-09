import { KPICard } from "@/components/ui/kpi-card";
import { buildDealerProfitLossKpiCards, type DealerPlKpiStats } from "@/lib/dealer/profit-loss/types";

export default function ProfitLossKpiStrip({ kpis }: { kpis: DealerPlKpiStats }) {
  const cards = buildDealerProfitLossKpiCards(kpis);

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showLink={false}
          showSparkline={false}
          deltaColor={card.deltaColor ?? "green"}
          className="rounded-sm border-[#1e293b] bg-[#0a101d]/60 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] backdrop-blur-sm"
        />
      ))}
    </section>
  );
}
