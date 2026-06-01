"use client";

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  value: string;
  sentiment?: "positive" | "negative" | "neutral";
  direction?: "up" | "down" | "flat";
  className?: string;
};

export default function ProfitLossTrendBadge({
  value,
  sentiment = "positive",
  direction = "up",
  className,
}: Props) {
  const colorClass =
    sentiment === "negative"
      ? "text-red-400"
      : sentiment === "neutral"
        ? "text-slate-400"
        : "text-emerald-400";

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10.5px] font-medium", colorClass, className)}>
      {direction === "up" && <TrendingUp className="h-3 w-3" />}
      {direction === "down" && <TrendingDown className="h-3 w-3" />}
      {value}
    </span>
  );
}
