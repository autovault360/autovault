"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SalesTaxKpi } from "@/lib/sales-tax/types";
import ProfitLossTrendBadge from "@/components/profit-loss/profit-loss-trend-badge";
import {
  salesTaxKpiIconBg,
  salesTaxKpiIconMap,
} from "./sales-tax-kpi-icons";

type Props = {
  kpis: SalesTaxKpi[];
};

export default function SalesTaxKpiCards({ kpis }: Props) {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = salesTaxKpiIconMap[kpi.id] ?? salesTaxKpiIconMap.collected;
        const iconBg =
          salesTaxKpiIconBg[kpi.id] ?? salesTaxKpiIconBg.collected;
        return (
          <Card
            key={kpi.id}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  iconBg,
                )}
              >
                <Icon className="h-[22px] w-[22px] stroke-[1.75]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] leading-tight text-slate-500">
                  {kpi.label}
                </div>
                <div className="mt-0.5 text-[18px] font-bold leading-tight text-white">
                  {kpi.valueFormatted}
                </div>
                {kpi.trend && (
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    <ProfitLossTrendBadge
                      value={kpi.trend.value}
                      sentiment={kpi.trend.sentiment}
                      direction={kpi.trend.direction}
                    />
                    <span className="text-[10px] text-slate-500">
                      {kpi.trend.comparisonLabel}
                    </span>
                  </div>
                )}
                {kpi.subtext && (
                  <div className="mt-0.5 text-[10.5px] text-slate-500">
                    {kpi.subtext}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
