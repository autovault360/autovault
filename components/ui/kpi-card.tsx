"use client";

import {
  BadgeCheck,
  BarChart3,
  Car,
  CircleAlert,
  DollarSign,
  Gavel,
  Handshake,
  Landmark,
  Leaf,
  Percent,
  PieChart,
  RefreshCw,
  Shield,
  ShoppingCart,
  TriangleAlert,
  Tag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
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
  | "landmark"
  | "shield"
  | "gavel"
  | "wallet"
  | "circle-alert"
  | "badge-check"
  | "triangle-alert"
  | "refresh-cw";

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
  shield: Shield,
  gavel: Gavel,
  wallet: Wallet,
  "circle-alert": CircleAlert,
  "badge-check": BadgeCheck,
  "triangle-alert": TriangleAlert,
  "refresh-cw": RefreshCw,
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
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 80 }}>
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
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <span className="text-[13px] font-bold text-white tabular-nums tracking-tight leading-none">
        {value}
      </span>
      <span className="mt-1 text-[9.5px] font-medium text-slate-500 tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function PeriodKPICard({
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
        "flex min-w-0 max-w-full flex-col rounded-lg border border-slate-700 bg-transparent p-4 text-slate-200 shadow-none w-full",
        className,
      )}
    >
      {/* Top Section Matrix: Side-by-Side Content Block */}
      <div className="flex items-start gap-3.5">
        {/* Left Side: Circular Icon Core Container */}
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors",
            iconBg[data.color] || "bg-emerald-500/10 text-emerald-400",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>

        {/* Right Side: High Density Descriptive Vertical Text Stack */}
        <div className="flex-1 min-w-0 flex flex-col items-start pt-0.5">
          <span className="text-[13px] font-semibold text-slate-400 tracking-tight leading-none">
            {data.label}
          </span>
          <span className="mt-1.5 text-[24px] font-bold leading-none tracking-tight text-white tabular-nums">
            {data.value}
          </span>
          {data.unit && (
            <span className="mt-1 text-[10px] font-medium text-slate-500 tracking-wide">
              {data.unit}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section Matrix: Segmented Timeline Array */}
      {periodMetrics.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          {hasDualFooter ? (
            <div className="grid grid-cols-2 relative">
              {/* Left Column Metric */}
              <PeriodFooterMetric
                value={periodMetrics[0]!.value}
                label={periodMetrics[0]!.label}
              />
              
              {/* Sharp Center Border Splitter Segment */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-800/80" />
              
              {/* Right Column Metric */}
              <PeriodFooterMetric
                value={periodMetrics[1]!.value}
                label={periodMetrics[1]!.label}
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
  valueClassName,
  className,
}: {
  data: KPICardData;
  showSparkline?: boolean;
  showLink?: boolean;
  deltaColor?: "green" | "red";
  layout?: KPICardLayout;
  valueClassName?: string;
  className?: string;
}) {
  if (layout === "period") {
    return <PeriodKPICard data={data} className={className} />;
  }

  const Icon = iconMap[data.icon];

  return (
    <Card
      className={cn(
        "flex h-full min-w-0 max-w-full flex-col rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none",
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
          <div className="text-[13px] text-slate-500">{data.label}</div>

          <div
            className={cn(
              "text-[18px] font-bold text-white tabular-nums",
              valueClassName,
            )}
          >
            {data.value}
          </div>

          {data.unit && (
            <div className="text-[13px] text-slate-500">{data.unit}</div>
          )}

          {data.delta && (
            <div
              className={cn(
                "text-[13px]",
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
  teal: "bg-teal-500/15 text-teal-400",
};
