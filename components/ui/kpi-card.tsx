"use client";

import {
  Car,
  Leaf,
  BarChart3,
  DollarSign,
  Tag,
  PieChart,
  TrendingDown,
  Users,
  UserPlus,
  Handshake,
  Percent,
  Landmark,
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
  users: Users,
  "user-plus": UserPlus,
  handshake: Handshake,
  percent: Percent,
  landmark: Landmark,
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

export function KPICard({
  data,
  showSparkline = true,
  showLink = true,
  deltaColor = "green",
  className,
}: {
  data: KPICardData;
  showSparkline?: boolean;
  showLink?: boolean;
  deltaColor?: "green" | "red";
  className?: string;
}) {
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
