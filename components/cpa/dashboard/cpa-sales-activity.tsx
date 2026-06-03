"use client";

import { Car, Tag, Leaf, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaSalesActivity } from "@/lib/cpa/types";

const iconMap = {
  car: Car,
  tag: Tag,
  leaf: Leaf,
  "bar-chart-3": BarChart3,
};

export default function CpaSalesActivity({
  items,
  monthLabel,
  bare,
}: {
  items: CpaSalesActivity[];
  monthLabel: string;
  bare?: boolean;
}) {
  const content = (
    <ul className="space-y-2.5">
      {items.map((row) => {
        const Icon = iconMap[row.icon as keyof typeof iconMap] ?? Car;
        return (
          <li key={row.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-400" />
              <span className="text-[11.5px] text-slate-300">{row.label}</span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-semibold text-white">{row.value}</span>
              {row.delta && (
                <span
                  className={cn(
                    "ml-2 text-[10px]",
                    row.deltaPositive ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {row.delta}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {`SALES ACTIVITY - ${monthLabel}`}
      </h3>
      {content}
    </Card>
  );
}
