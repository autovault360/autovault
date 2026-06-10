"use client";

import {
  BadgeCheck,
  BarChart3,
  Car,
  DollarSign,
  Percent,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KPIIconName } from "@/components/ui/kpi-card";

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  "dollar-sign": DollarSign,
  percent: Percent,
  wallet: Wallet,
  "badge-check": BadgeCheck,
};

const iconBg: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
  violet: "bg-purple-500/15 text-purple-400",
  orange: "bg-amber-500/15 text-amber-400",
  teal: "bg-teal-500/15 text-teal-400",
};

export type PayrollKpiCardData = {
  icon: KPIIconName;
  color: string;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendColor?: "green" | "blue";
  valueClassName?: string;
};

export default function PayrollKpiCard({
  data,
  className,
}: {
  data: PayrollKpiCardData;
  className?: string;
}) {
  const Icon = iconMap[data.icon] ?? BarChart3;

  return (
    <Card
      className={cn(
        "flex min-w-0 flex-col rounded-lg border border-slate-700/80 bg-card p-4 text-slate-200 shadow-none",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full",
            iconBg[data.color] ?? "bg-emerald-500/15 text-emerald-400",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[13px] font-semibold leading-none text-slate-400">
            {data.label}
          </div>
          <div
            className={cn(
              "mt-1.5 text-[22px] font-bold leading-none tracking-tight text-white tabular-nums",
              data.valueClassName,
            )}
          >
            {data.value}
          </div>
          {data.unit && (
            <div className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">
              {data.unit}
            </div>
          )}
        </div>
      </div>
      {data.trend && (
        <div className="mt-3.5 border-t border-slate-800/60 pt-2.5">
          <span
            className={cn(
              "text-[12px] font-medium",
              data.trendColor === "blue"
                ? "text-blue-400"
                : "text-emerald-400",
            )}
          >
            {data.trend}
          </span>
        </div>
      )}
    </Card>
  );
}
