"use client";

import type { CSSProperties } from "react";
import { AV, AV_ACCENT } from "@/lib/ui/autovault-design-tokens";
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

export type KPITrendMetric = {
  percent: string;
  comparisonLabel: string;
  direction: "up" | "down" | "flat";
  sentiment: "positive" | "negative" | "neutral";
};

export type KPICardData = {
  icon: KPIIconName;
  color: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  trend?: KPITrendMetric;
  link: string;
  sparkColor: string;
  sparkPoints: string;
  /** Optional footer stats for period-based profile KPIs (This Year, Lifetime, etc.). */
  periodMetrics?: KPIPeriodMetric[];
};

export type KPICardLayout =
  | "default"
  | "period"
  | "accent-top"
  | "stat"
  | "top-performer";

export type KPICardVariant = KPICardLayout;

export type StatKpiData = {
  accent: "green" | "blue" | "orange" | "purple" | "red";
  icon?: React.ReactNode;
  label: string;
  value: string;
  foot: string;
};

export type TopPerformerKpiRow = {
  label: string;
  value: string;
  emphasis?: "profit" | "loss" | "default";
};

export type TopPerformerKpiData = {
  categoryName: string;
  accentColor: string;
  rows: TopPerformerKpiRow[];
  empty?: boolean;
};

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
        "flex bg-card min-w-0 max-w-full flex-col rounded-lg border border-slate-700 p-4 text-slate-200 shadow-none w-full",
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

const accentTopBorder: Record<string, string> = {
  blue: "border-t-blue-500",
  green: "border-t-emerald-500",
  violet: "border-t-purple-500",
  orange: "border-t-orange-500",
  teal: "border-t-teal-500",
  red: "border-t-red-500",
  amber: "border-t-amber-500",
};

function StatKPICard({
  data,
  className,
}: {
  data: StatKpiData;
  className?: string;
}) {
  const accent = AV_ACCENT[data.accent] ?? AV.blue;

  return (
    <div
      className={cn(
        "group relative min-w-[140px] flex-1 cursor-default overflow-hidden rounded-xl border px-5 py-[18px] transition-[background,border-color] duration-[180ms] hover:border-white/10 hover:bg-white/[0.025]",
        className,
      )}
      style={{
        backgroundColor: AV.panel,
        borderColor: AV.border,
      }}
    >
      <div
        className="absolute bottom-0 left-5 right-5 h-0.5 origin-left scale-x-0 rounded-sm transition-transform duration-[220ms] ease-out group-hover:scale-x-100"
        style={{ backgroundColor: accent }}
      />
      {data.icon ? (
        <div className="mb-2 text-[15px]" style={{ color: accent }}>
          {data.icon}
        </div>
      ) : null}
      <div
        className="text-[10px] font-bold uppercase tracking-[1.2px] whitespace-nowrap"
        style={{ color: AV.muted }}
      >
        {data.label}
      </div>
      <div
        className="mt-[5px] font-mono text-[19px] font-extrabold leading-[1.1]"
        style={{ color: accent }}
      >
        {data.value}
      </div>
      <div className="mt-[3px] text-[10.5px]" style={{ color: AV.muted }}>
        {data.foot}
      </div>
    </div>
  );
}

function TopPerformerKPICard({
  data,
  className,
}: {
  data: TopPerformerKpiData;
  className?: string;
}) {
  const accent = data.accentColor;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border px-[18px] py-4",
        data.empty && "opacity-45",
        className,
      )}
      style={{
        backgroundColor: AV.panel,
        borderColor: AV.border,
      }}
    >
      <div
        className="absolute left-0 top-0 h-[3px] w-full"
        style={{ backgroundColor: accent }}
      />
      <div className="cat-head mb-3 flex items-center gap-2.5">
        <div
          className="cat-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[15px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <div className="cat-name text-sm font-extrabold text-[#e7ecf3]">{data.categoryName}</div>
      </div>
      {data.rows.map((row) => (
        <div
          key={row.label}
          className="cat-row flex justify-between border-t border-dashed py-[5px] text-xs first:border-t-0"
          style={{ borderColor: AV.border, color: AV.muted }}
        >
          <span>{row.label}</span>
          <b
            className="font-mono text-[12.5px] font-bold"
            style={{
              color:
                row.emphasis === "profit"
                  ? AV.green
                  : row.emphasis === "loss"
                    ? AV.red
                    : accent,
            }}
          >
            {row.value}
          </b>
        </div>
      ))}
    </div>
  );
}

function AccentTopKPICard({
  data,
  className,
}: {
  data: KPICardData;
  className?: string;
}) {
  const Icon = iconMap[data.icon];
  const trend = data.trend;
  const trendColorClass =
    trend?.sentiment === "negative"
      ? "text-red-400"
      : trend?.sentiment === "neutral"
        ? "text-slate-400"
        : "text-emerald-400";
  const TrendIcon =
    trend?.direction === "down"
      ? TrendingDown
      : trend?.direction === "up"
        ? TrendingUp
        : null;

  return (
    <Card
      className={cn(
        "flex min-h-[108px] min-w-0 max-w-full flex-col rounded-lg border border-white/10 bg-[#0c1220] p-3 text-slate-200 shadow-none",
        "border-t-2",
        accentTopBorder[data.color] ?? "border-t-emerald-500",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full",
            iconBg[data.color],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium leading-tight text-slate-500">
            {data.label}
          </div>

          <div className="mt-1 text-[20px] font-bold leading-none tracking-tight text-white tabular-nums">
            {data.value}
          </div>

          {trend && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[12px] font-semibold leading-none",
                  trendColorClass,
                )}
              >
                {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
                {trend.percent}
              </span>
              {trend.comparisonLabel ? (
                <span className="text-[11px] leading-none text-slate-500">
                  {trend.comparisonLabel}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function KPICard({
  data,
  statData,
  topPerformerData,
  showSparkline = true,
  showLink = true,
  deltaColor = "green",
  deltaClassName,
  layout = "default",
  variant,
  valueClassName,
  className,
  valueStyle,
  iconStyle,
}: {
  data?: KPICardData;
  statData?: StatKpiData;
  topPerformerData?: TopPerformerKpiData;
  showSparkline?: boolean;
  showLink?: boolean;
  deltaColor?: "green" | "red";
  deltaClassName?: string;
  layout?: KPICardLayout;
  variant?: KPICardVariant;
  valueClassName?: string;
  className?: string;
  valueStyle?: CSSProperties;
  iconStyle?: CSSProperties;
}) {
  const resolvedVariant = variant ?? layout;

  if (resolvedVariant === "stat" && statData) {
    return <StatKPICard data={statData} className={className} />;
  }

  if (resolvedVariant === "top-performer" && topPerformerData) {
    return <TopPerformerKPICard data={topPerformerData} className={className} />;
  }

  if (!data) {
    return null;
  }

  if (resolvedVariant === "period") {
    return <PeriodKPICard data={data} className={className} />;
  }

  if (resolvedVariant === "accent-top") {
    return <AccentTopKPICard data={data} className={className} />;
  }

  const Icon = iconMap[data.icon];

  return (
    <Card
      className={cn(
        "flex h-full bg-card min-w-0 max-w-full flex-col rounded-sm border border-slate-700 p-3 text-slate-200 shadow-none",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full",
            iconBg[data.color],
          )}
          style={iconStyle}
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
            style={valueStyle}
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
                deltaClassName ??
                (deltaColor === "red" ? "text-red-400" : "text-emerald-400"),
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
