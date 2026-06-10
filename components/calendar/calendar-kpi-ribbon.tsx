"use client";

import { Calendar, Car, DollarSign, TrendingUp, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalendarKpi } from "@/lib/calendar/types";
import ProfitLossTrendBadge from "@/components/profit-loss/profit-loss-trend-badge";

const iconMap = {
  blue: Car,
  green: DollarSign,
  purple: TrendingUp,
  amber: Calendar,
  teal: User,
};

const iconBg: Record<CalendarKpi["iconColor"], string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
  purple: "bg-purple-500/15 text-purple-400",
  amber: "bg-amber-500/15 text-amber-400",
  teal: "bg-teal-500/15 text-teal-400",
};

type Props = {
  kpis: CalendarKpi[];
};

export default function CalendarKpiRibbon({ kpis }: Props) {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.iconColor];
        return (
          <Card
            key={kpi.id}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-700 bg-card p-3 text-slate-200 shadow-none"
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
                  {kpi.value}
                </div>
                {kpi.delta && (
                  <ProfitLossTrendBadge
                    value={kpi.delta}
                    sentiment={kpi.deltaSentiment}
                    direction={kpi.deltaDirection}
                  />
                )}
                {kpi.subtext && !kpi.delta && (
                  <div className="text-[13px] text-slate-500">{kpi.subtext}</div>
                )}
              </div>
            </div>
            {(kpi.comparisonLabel || kpi.subtext) && kpi.delta && (
              <div className="mt-1 text-[10px] text-slate-500">
                {kpi.comparisonLabel || kpi.subtext}
              </div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
