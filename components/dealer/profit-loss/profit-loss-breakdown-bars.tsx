"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import type { DealerPlBreakdownItem } from "@/lib/dealer/profit-loss/types";

type Props = {
  title: string;
  items: DealerPlBreakdownItem[];
  variant: "income" | "expense";
};

export default function ProfitLossBreakdownBars({ title, items, variant }: Props) {
  const maxPercent = Math.max(...items.map((item) => item.percentOfTotal), 1);

  return (
    <Card className="h-full rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3
        className={
          variant === "income"
            ? "mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400"
            : "mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-400"
        }
      >
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item) => {
          const barWidth = (item.percentOfTotal / maxPercent) * 100;

          return (
            <li key={item.id}>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <span className="text-[11.5px] text-slate-200">{item.label}</span>
                <div className="shrink-0 text-right">
                  <div className="text-[11.5px] font-semibold tabular-nums text-white">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-[10px] tabular-nums text-slate-500">
                    {item.percentOfTotal.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
