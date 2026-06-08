"use client";

import {
  Briefcase,
  DollarSign,
  Package,
  Percent,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlKpiMetric } from "@/lib/profit-loss/types";
import ProfitLossTrendBadge from "./profit-loss-trend-badge";

const iconMap: Record<PlKpiMetric["iconColor"], LucideIcon> = {
  green: DollarSign,
  red: Briefcase,
  purple: ShoppingBag,
  orange: Package,
  blue: DollarSign,
  teal: Percent,
};

const iconBg: Record<PlKpiMetric["iconColor"], string> = {
  green: "bg-emerald-500/15 text-emerald-400",
  red: "bg-red-500/15 text-red-400",
  purple: "bg-purple-500/15 text-purple-400",
  orange: "bg-orange-500/15 text-orange-400",
  blue: "bg-blue-500/15 text-blue-400",
  teal: "bg-teal-500/15 text-teal-400",
};

type Props = {
  kpis: PlKpiMetric[];
};

export default function ProfitLossKPICards({ kpis }: Props) {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.iconColor];
        return (
          <Card
            key={kpi.id}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  iconBg[kpi.iconColor],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-tight text-slate-500">
                  {kpi.label}
                </div>
                <div className="mt-0.5 text-[18px] font-bold leading-tight text-white">
                  {kpi.valueFormatted}
                </div>
                <ProfitLossTrendBadge
                  value={kpi.delta}
                  sentiment={kpi.deltaSentiment}
                  direction={kpi.deltaDirection}
                />
              </div>
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              {kpi.comparisonLabel}
            </div>
          </Card>
        );
      })}
    </section>
  );
}
