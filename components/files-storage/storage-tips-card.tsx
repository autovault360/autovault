"use client";

import { Card } from "@/components/ui/card";
import BreakdownDonutChart from "@/components/shared/breakdown-donut-chart";
import type { StorageBreakdownSegment } from "@/lib/files-storage/types";

type Props = {
  usagePercent: number;
  tips: string[];
  breakdown: StorageBreakdownSegment[];
};

export default function StorageTipsCard({ usagePercent, tips, breakdown }: Props) {
  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-4 shadow-none">
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Storage Breakdown
      </h2>

      <BreakdownDonutChart
        segments={breakdown}
        centerPrimary={usagePercent}
        centerSecondary="Used"
        centerMode="percent"
      >
        {tips.length > 0 && (
          <div className="">
            <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Tips
            </h3>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-[11.5px] text-slate-300"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BreakdownDonutChart>
    </Card>
  );
}
