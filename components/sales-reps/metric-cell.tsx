"use client";

import { cn } from "@/lib/utils";
import MiniSparkline from "./mini-sparkline";

type Props = {
  value: string;
  delta: string;
  deltaColor: "green" | "red";
  sparkPoints: string;
  sparkId: string;
};

const SPARK_COLORS = {
  green: "#10b981",
  red: "#ef4444",
} as const;

export default function MetricCell({
  value,
  delta,
  deltaColor,
  sparkPoints,
  sparkId,
}: Props) {
  const sparkColor = SPARK_COLORS[deltaColor];

  return (
    <div className="min-w-[112px] py-0.5">
      <div className="text-[12.5px] font-semibold leading-tight text-white">
        {value}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[10px] font-medium leading-tight",
          deltaColor === "red" ? "text-red-400" : "text-emerald-400",
        )}
      >
        {delta}
      </div>
      <MiniSparkline
        color={sparkColor}
        points={sparkPoints}
        id={sparkId}
        className="mt-1.5 h-6 w-full max-w-[96px]"
        showDots
        showFill
      />
    </div>
  );
}
