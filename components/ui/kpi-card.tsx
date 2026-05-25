"use client";

import {
  Car,
  Leaf,
  BarChart3,
  DollarSign,
  Tag,
  PieChart,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KPIIconName =
  | "car"
  | "leaf"
  | "bar-chart-3"
  | "dollar-sign"
  | "tag"
  | "pie-chart"
  | "trending-down";

const iconMap: Record<KPIIconName, LucideIcon> = {
  car: Car,
  leaf: Leaf,
  "bar-chart-3": BarChart3,
  "dollar-sign": DollarSign,
  tag: Tag,
  "pie-chart": PieChart,
  "trending-down": TrendingDown,
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
};

function Sparkline({
  color,
  points,
  id,
}: {
  color: string;
  points: string;
  id: string;
}) {
  const coords = points.split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return { x, y };
  });
  const fillPoints = `0,50 ${points} 220,50`;

  return (
    <svg
      viewBox="0 0 220 50"
      className="mt-1 h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id={`spark-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor={color} floodOpacity="0.35" />
        </filter>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-fill-${id})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        filter={`url(#spark-glow-${id})`}
      />
      {coords.map(({ x, y }, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2.5}
          fill={color}
          filter={`url(#spark-glow-${id})`}
        />
      ))}
    </svg>
  );
}

export function KPICard({ data }: { data: KPICardData }) {
  const Icon = iconMap[data.icon];
  const sparkId = data.label.replace(/\s+/g, "-").toLowerCase();

  return (
    <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none">
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full",
            iconBg[data.color],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[10.5px] text-slate-500">{data.label}</div>
          <div className="mt-0.5 text-[18px] font-bold text-white">
            {data.value}
          </div>
          {data.unit && (
            <div className="text-[10.5px] text-slate-500">{data.unit}</div>
          )}
          {data.delta && (
            <div className="text-[10.5px] text-emerald-400">{data.delta}</div>
          )}
        </div>
      </div>
      <Sparkline color={data.sparkColor} points={data.sparkPoints} id={sparkId} />
      <button
        type="button"
        className="mt-auto -mx-3 -mb-3 rounded-b-sm border-t border-slate-700 bg-transparent py-2.5 text-center text-[11.5px] font-medium text-blue-400"
      >
        {data.link} →
      </button>
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
