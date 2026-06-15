"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";

const donutData = [
  { name: "In Stock", value: 53, color: "#15803d" },
  { name: "At Auction", value: 22, color: "#2563eb" },
  { name: "Sold", value: 19, color: "#233b6b" },
  { name: "Pending", value: 6, color: "#f97316" },
];

export function ChartDonut({ size = "default" }: { size?: "default" | "showcase" | "compact" }) {
  const dimensions =
    size === "showcase"
      ? { box: "h-[96px] w-[96px]", inner: 30, outer: 42, center: "text-[20px]", label: "text-[9px]" }
      : size === "compact"
        ? { box: "h-[110px] w-[110px]", inner: 36, outer: 50, center: "text-[24px]", label: "text-[10px]" }
        : { box: "h-[150px] w-[150px]", inner: 48, outer: 68, center: "text-[34px]", label: "text-[12px]" };

  return (
    <div className={["relative shrink-0", dimensions.box].join(" ")}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={donutData}
            cx="50%"
            cy="50%"
            innerRadius={dimensions.inner}
            outerRadius={dimensions.outer}
            dataKey="value"
            stroke="none"
          >
            {donutData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={["font-medium leading-none text-[var(--lp-dash-value)]", dimensions.center].join(" ")}>
            128
          </div>
          <div className={["mt-0.5 text-[var(--lp-fg-muted)]", dimensions.label].join(" ")}>
            Total Vehicles
          </div>
        </div>
      </div>
    </div>
  );
}

const sparklineData = [
  { x: 0, y: 72 }, { x: 1, y: 71.5 }, { x: 2, y: 71 }, { x: 3, y: 70.8 },
  { x: 4, y: 70.5 }, { x: 5, y: 70.2 }, { x: 6, y: 70 }, { x: 7, y: 69.8 },
  { x: 8, y: 69.5 }, { x: 9, y: 69 }, { x: 10, y: 68.5 }, { x: 11, y: 68 },
  { x: 12, y: 67.5 }, { x: 13, y: 67 }, { x: 14, y: 66 }, { x: 15, y: 65 },
  { x: 16, y: 64 }, { x: 17, y: 63 }, { x: 18, y: 62 }, { x: 19, y: 61 },
  { x: 20, y: 60 }, { x: 21, y: 59 }, { x: 22, y: 58 }, { x: 23, y: 57 },
  { x: 24, y: 56 }, { x: 25, y: 55 }, { x: 26, y: 54 }, { x: 27, y: 53 },
  { x: 28, y: 52 }, { x: 29, y: 51 }, { x: 30, y: 51 }, { x: 31, y: 51.5 },
  { x: 32, y: 52 }, { x: 33, y: 52.5 }, { x: 34, y: 53 }, { x: 35, y: 53.5 },
  { x: 36, y: 54 }, { x: 37, y: 54.5 }, { x: 38, y: 55 }, { x: 39, y: 54 },
  { x: 40, y: 53 }, { x: 41, y: 52 }, { x: 42, y: 51 }, { x: 43, y: 50 },
  { x: 44, y: 49 }, { x: 45, y: 48 }, { x: 46, y: 47 }, { x: 47, y: 46 },
  { x: 48, y: 45 }, { x: 49, y: 44 }, { x: 50, y: 43 }, { x: 51, y: 42 },
  { x: 52, y: 41 }, { x: 53, y: 40 }, { x: 54, y: 39 }, { x: 55, y: 38 },
  { x: 56, y: 37 }, { x: 57, y: 36 }, { x: 58, y: 35 }, { x: 59, y: 34 },
  { x: 60, y: 33 }, { x: 61, y: 32 }, { x: 62, y: 31 }, { x: 63, y: 30 },
];

export function ChartSparkline({
  stroke,
  variant,
  height = 82,
}: {
  stroke: string;
  variant: "green" | "orange";
  height?: number;
}) {
  const gradientId = variant === "green" ? "spark-fill-green" : "spark-fill-orange";
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="y"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
