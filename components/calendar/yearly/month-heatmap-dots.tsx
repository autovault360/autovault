"use client";

import { HEATMAP_COLORS } from "@/lib/calendar/constants";
import type { UnitsColorTier } from "@/lib/calendar/types";

type Props = {
  tiers: UnitsColorTier[];
};

export default function MonthHeatmapDots({ tiers }: Props) {
  return (
    <div className="mt-2 grid grid-cols-7 gap-[3px]">
      {tiers.map((tier, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${HEATMAP_COLORS[tier]}`}
        />
      ))}
    </div>
  );
}
