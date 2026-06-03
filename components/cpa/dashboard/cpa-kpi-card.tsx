"use client";

import {
  Car,
  DollarSign,
  TrendingDown,
  BarChart3,
  PieChart,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaKpi } from "@/lib/cpa/types";

const icons: Record<string, LucideIcon> = {
  car: Car,
  "dollar-sign": DollarSign,
  "trending-down": TrendingDown,
  "bar-chart-3": BarChart3,
  "pie-chart": PieChart,
  landmark: Landmark,
};

const colorMap = {
  green: "bg-emerald-500/15 text-emerald-400",
  purple: "bg-purple-500/15 text-purple-400",
  blue: "bg-blue-500/15 text-blue-400",
  red: "bg-red-500/15 text-red-400",
  teal: "bg-teal-500/15 text-teal-400",
  orange: "bg-orange-500/15 text-orange-400",
};

export default function CpaKpiCard({ kpi }: { kpi: CpaKpi }) {
  const Icon = icons[kpi.icon] ?? DollarSign;
  return (
    <Card className="flex flex-col gap-2 rounded-lg border border-slate-700/80 bg-[#0b1322]/80 p-3.5 shadow-none">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full",
            colorMap[kpi.color],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            {kpi.label}
          </p>
          <p className="text-xl font-bold text-white">{kpi.value}</p>
          <p
            className={cn(
              "text-[10px]",
              kpi.deltaPositive ? "text-emerald-400" : "text-red-400",
            )}
          >
            {kpi.delta}
          </p>
        </div>
      </div>
    </Card>
  );
}
