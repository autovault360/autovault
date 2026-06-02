"use client";

import { HEATMAP_COLORS } from "@/lib/calendar/constants";
import type { UnitsColorTier } from "@/lib/calendar/types";

const LEGEND_ITEMS: Array<{ tier: UnitsColorTier; label: string }> = [
  { tier: "low", label: "1-2 Units" },
  { tier: "mid", label: "3-4 Units" },
  { tier: "high", label: "5+ Units" },
  { tier: "none", label: "No Sales" },
];

export default function CalendarActivityLegend() {
  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-4 text-[10.5px] text-slate-500">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.tier} className="inline-flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${HEATMAP_COLORS[item.tier]}`}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
