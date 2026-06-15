"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { kpiGridClass } from "@/lib/ui/kpi-grid";
import type { ReminderKpi } from "@/lib/reminders/types";

const iconMap = {
  red: AlertCircle,
  amber: Clock,
  purple: Calendar,
  blue: Calendar,
  green: CheckCircle2,
};

const iconBg: Record<ReminderKpi["color"], string> = {
  red: "bg-red-500/15 text-red-400",
  amber: "bg-amber-500/15 text-amber-400",
  purple: "bg-purple-500/15 text-purple-400",
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
};

type Props = {
  kpis: ReminderKpi[];
};

export default function ReminderKpiCards({ kpis }: Props) {
  return (
    <section className={kpiGridClass(kpis.length, "mb-3.5")}>
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.color];
        return (
          <Card
            key={kpi.id}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-700 bg-card p-3 text-slate-200 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  iconBg[kpi.color],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-tight text-slate-500">
                  {kpi.label}
                </div>
                <div className="mt-0.5 text-[18px] font-bold text-white">
                  {kpi.count}
                </div>
                <div className="text-[13px] text-slate-500">
                  {kpi.description}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
