"use client";

import { KPICard } from "@/components/ui/kpi-card";
import type { VehiclesReportCategoryCard } from "@/lib/financials/vehicles-report/types";

export default function CategoryPerformanceGrid({
  cards,
}: {
  cards: VehiclesReportCategoryCard[];
}) {
  return (
    <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[14px]">
      {cards.map((card) => (
        <KPICard
          key={card.id}
          variant="top-performer"
          topPerformerData={card}
        />
      ))}
    </div>
  );
}
