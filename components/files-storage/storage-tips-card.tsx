"use client";

import { Card } from "@/components/ui/card";
import { formatStorageGb } from "@/lib/files-storage/format-utils";
import type { StorageBreakdownSegment } from "@/lib/files-storage/types";

type Props = {
  usagePercent: number;
  tips: string[];
  breakdown: StorageBreakdownSegment[];
};

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 50;
const STROKE = 8;

export default function StorageTipsCard({ usagePercent, tips, breakdown }: Props) {
  let cumulativeOffset = 0;
  const segments = breakdown.map((s) => {
    const offset = cumulativeOffset;
    cumulativeOffset += (s.percent / 100) * CIRCUMFERENCE;
    return { ...s, offset };
  });

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-4 shadow-none">
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Storage Breakdown
      </h2>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative mx-auto h-[120px] w-[120px] shrink-0 sm:mx-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="rgb(30 41 59)"
              strokeWidth={STROKE}
            />
            {segments.map((s) => {
              if (s.percent === 0) return null;
              const length = (s.percent / 100) * CIRCUMFERENCE;
              return (
                <circle
                  key={s.id}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[16px] font-bold text-white">
              {usagePercent}%
            </div>
            <div className="text-[9px] text-slate-500">Used</div>
          </div>
        </div>
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
      </div>

    </Card>
  );
}
