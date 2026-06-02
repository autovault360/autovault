"use client";

import { cn } from "@/lib/utils";

export type BreakdownDonutSegment = {
  id: string;
  label: string;
  color: string;
  percent: number;
};

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 50;
const STROKE = 8;

type Props = {
  segments: BreakdownDonutSegment[];
  /** Shown in the center when centerMode is "percent" (number appended with %). */
  centerPrimary: string | number;
  centerSecondary?: string;
  centerMode?: "percent" | "text";
  children?: React.ReactNode;
  className?: string;
};

export default function BreakdownDonutChart({
  segments,
  centerPrimary,
  centerSecondary,
  centerMode = "percent",
  children,
  className,
}: Props) {
  let cumulativeOffset = 0;
  const chartSegments = segments.map((s) => {
    const offset = cumulativeOffset;
    cumulativeOffset += (s.percent / 100) * CIRCUMFERENCE;
    return { ...s, offset };
  });

  const centerDisplay =
    centerMode === "percent" ? `${centerPrimary}%` : centerPrimary;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 sm:flex-row sm:items-start",
        className,
      )}
    >
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
          {chartSegments.map((s) => {
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
          <div className="text-[16px] font-bold text-white">{centerDisplay}</div>
          {centerSecondary && (
            <div className="text-[9px] text-slate-500">{centerSecondary}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
