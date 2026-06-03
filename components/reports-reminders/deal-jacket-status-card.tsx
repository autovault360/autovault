"use client";

import { cn } from "@/lib/utils";
import type { DealJacketStatusSegment } from "@/lib/reports-reminders/types";
import {
  ReportCardHeaderWithLink,
  ReportCardShell,
  ReportViewMore,
} from "./report-card-primitives";

const labelStyles: Record<DealJacketStatusSegment["tone"], string> = {
  green: "text-emerald-400",
  blue: "text-blue-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
};

const badgeStyles: Record<DealJacketStatusSegment["tone"], string> = {
  green: "border-emerald-500/35 bg-emerald-500/20 text-emerald-400",
  blue: "border-blue-500/35 bg-blue-500/20 text-blue-400",
  orange: "border-orange-500/35 bg-orange-500/20 text-orange-400",
  emerald: "border-emerald-500/35 bg-emerald-500/20 text-emerald-400",
};

const columnBg: Record<DealJacketStatusSegment["tone"], string> = {
  green: "border-emerald-500/25 bg-emerald-950/45",
  blue: "border-blue-500/25 bg-blue-950/45",
  orange: "border-orange-500/25 bg-orange-950/40",
  emerald: "border-emerald-500/20 bg-emerald-950/35",
};

type Props = {
  segments: DealJacketStatusSegment[];
};

export default function DealJacketStatusCard({ segments }: Props) {
  return (
    <ReportCardShell compact className="flex h-full flex-col">
      <ReportCardHeaderWithLink title="DEAL JACKET STATUS" compact />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1" aria-hidden />
        <div className="grid shrink-0 grid-cols-4 gap-1">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={cn(
                "flex min-w-0 flex-col items-center rounded border px-0.5 py-1.5 text-center",
                columnBg[seg.tone],
              )}
            >
              <span
                className={cn(
                  "text-[8.5px] font-semibold leading-tight",
                  labelStyles[seg.tone],
                )}
              >
                {seg.label}
              </span>
              <span className="my-1 text-[17px] font-bold leading-none tabular-nums text-white">
                {seg.count}
              </span>
              <span
                className={cn(
                  "rounded px-1 py-px text-[8px] font-semibold tabular-nums",
                  badgeStyles[seg.tone],
                )}
              >
                {seg.percent}
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1" aria-hidden />
      </div>

      <ReportViewMore
        label="View Deal Jackets"
        compact
        className="!mt-0 shrink-0"
      />
    </ReportCardShell>
  );
}
