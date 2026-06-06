"use client";

import {
  BarChart3,
  Car,
  DollarSign,
  Handshake,
  Landmark,
  Leaf,
  Percent,
  PieChart,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type KPIIconName =
  | "car"
  | "leaf"
  | "bar-chart-3"
  | "dollar-sign"
  | "tag"
  | "pie-chart"
  | "trending-down"
  | "trending-up"
  | "shopping-cart"
  | "users"
  | "user-plus"
  | "handshake"
  | "percent"
  | "landmark";

const iconMap: Record<KPIIconName, LucideIcon> = {
  car: Car,
  leaf: Leaf,
  "bar-chart-3": BarChart3,
  "dollar-sign": DollarSign,
  tag: Tag,
  "pie-chart": PieChart,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "shopping-cart": ShoppingCart,
  users: Users,
  "user-plus": UserPlus,
  handshake: Handshake,
  percent: Percent,
  landmark: Landmark,
};

export type KPIPeriodMetric = {
  value: string;
  label: string;
};

export type KPICardData = {
  icon: KPIIconName;
  color: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  link: string;
  sparkColor: string;
  sparkPoints: string;
  /** Optional footer stats for period-based profile KPIs (This Year, Lifetime, etc.). */
  periodMetrics?: KPIPeriodMetric[];
};

export type KPICardLayout = "default" | "period";

function Sparkline({
  color,
  points,
}: {
  color: string;
  points: string;
}) {
  const data = points.split(" ").map((p, i) => {
    const [, y] = p.split(",").map(Number);
    return { i, v: 50 - y };
  });

  return (
    <div className="absolute inset-0" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sf-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 4,
              fontSize: 12,
              color: "#e2e8f0",
              padding: "4px 8px",
            }}
            labelStyle={{ display: "none" }}
            formatter={(value) => [value, "Value"] as [string, string]}
            cursor={false}
          />
          <Area
            type="natural"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#sf-${color.replace("#", "")})`}
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ fill: color, r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PeriodFooterMetric({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="truncate text-[13px] font-bold tabular-nums text-white">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

function PeriodKPICard({
  data,
  className,
}: {
  data: KPICardData;
  className?: string;
}) {
  const Icon = iconMap[data.icon];
  const periodMetrics = data.periodMetrics ?? [];
  const hasDualFooter = periodMetrics.length >= 2;

  return (
    <Card
      className={cn(
        "flex h-full min-h-[148px] flex-col rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full",
            iconBg[data.color],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <p className="min-w-0 flex-1 pt-1 text-[10.5px] font-medium leading-snug text-slate-400">
          {data.label}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-1.5 text-center">
        <p className="text-[24px] font-bold leading-none tracking-tight text-white tabular-nums">
          {data.value}
        </p>
        {data.unit && (
          <p className="mt-1 text-[10px] text-slate-500">{data.unit}</p>
        )}
      </div>

      {periodMetrics.length > 0 && (
        <div className="mt-auto border-t border-slate-800/80 pt-2">
          {hasDualFooter ? (
            <div className="grid grid-cols-2 gap-1">
              <PeriodFooterMetric
                value={periodMetrics[0]!.value}
                label={periodMetrics[0]!.label}
              />
              <PeriodFooterMetric
                value={periodMetrics[1]!.value}
                label={periodMetrics[1]!.label}
                className="text-right"
              />
            </div>
          ) : (
            <PeriodFooterMetric
              value={periodMetrics[0]!.value}
              label={periodMetrics[0]!.label}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export function KPICard({
  data,
  showSparkline = true,
  showLink = true,
  deltaColor = "green",
  layout = "default",
  className,
}: {
  data: KPICardData;
  showSparkline?: boolean;
  showLink?: boolean;
  deltaColor?: "green" | "red";
  layout?: KPICardLayout;
  className?: string;
}) {
  if (layout === "period") {
    return <PeriodKPICard data={data} className={className} />;
  }

  const Icon = iconMap[data.icon];

  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full",
            iconBg[data.color],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="text-[10.5px] text-slate-500">{data.label}</div>

          <div className="text-[18px] font-bold text-white">
            {data.value}
          </div>

          {data.unit && (
            <div className="text-[10.5px] text-slate-500">{data.unit}</div>
          )}

          {data.delta && (
            <div
              className={cn(
                "text-[10.5px]",
                deltaColor === "red"
                  ? "text-red-400"
                  : "text-emerald-400",
              )}
            >
              {data.delta}
            </div>
          )}
        </div>
      </div>

      {showSparkline && (
        <div className="relative flex-1 min-h-[80px] py-2">
          <Sparkline
            color={data.sparkColor}
            points={data.sparkPoints}
          />
        </div>
      )}

      {showLink && (
        <button
          type="button"
          className="mt-auto -mx-3 -mb-3 rounded-b-sm border-t border-slate-700 bg-transparent py-2.5 text-center text-[11.5px] font-medium text-blue-400"
        >
          {data.link} ...
        </button>
      )}
    </Card>
  );
}

const iconBg: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
  violet: "bg-purple-500/15 text-purple-400",
  amber: "bg-amber-500/15 text-amber-400",
  orange: "bg-orange-500/15 text-orange-400",
  red: "bg-red-400/15 text-red-500",
};
