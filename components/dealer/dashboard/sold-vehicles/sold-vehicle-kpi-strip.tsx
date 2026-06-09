"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import type { SoldVehicleKpiStrip } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const CARD_CLASS = "border-[#1e293b] bg-card backdrop-blur-sm";

export default function SoldVehicleKpiStrip({
  kpis,
  loading,
}: {
  kpis: SoldVehicleKpiStrip;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("rounded-sm border p-3", CARD_CLASS)}>
            <div className="flex items-start gap-2.5">
              <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-2.5 w-20" />
                <SkeletonBar className="h-5 w-16" />
                <SkeletonBar className="h-2 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { data: kpis.totalSold, layout: "default" as const },
    { data: kpis.totalSales, layout: "default" as const },
    { data: kpis.totalGrossProfit, layout: "default" as const },
    { data: kpis.averageGrossProfit, layout: "default" as const },
    { data: kpis.soldThisMonth, layout: "default" as const },
    { data: kpis.pendingPayments, layout: "period" as const },
  ];

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ data, layout }) => (
        <KPICard
          key={data.label}
          data={data}
          layout={layout}
          showSparkline={false}
          showLink={false}
          className={CARD_CLASS}
        />
      ))}
    </div>
  );
}
