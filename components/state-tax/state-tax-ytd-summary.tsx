"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import BreakdownDonutChart from "@/components/shared/breakdown-donut-chart";
import { cn } from "@/lib/utils";
import type { StateTaxReport } from "@/lib/state-tax/types";

type Props = {
  summary: StateTaxReport["ytdSummary"];
};

export default function StateTaxYtdSummary({ summary }: Props) {
  const { chart } = summary;

  return (
    <Card className="flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-white">
          State Tax Summary (Year to Date)
        </h2>
        <Link
          href="#"
          className="shrink-0 text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          View Full Report
        </Link>
      </div>

      <div className="mb-4 space-y-0 border-b border-slate-800/60 pb-3">
        {summary.rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-slate-800/40 py-2.5 last:border-0"
          >
            <span className="text-[11.5px] text-slate-400">{row.label}</span>
            <span
              className={cn(
                "text-[11.5px] font-semibold",
                row.highlight === "danger" ? "text-red-400" : "text-slate-200",
              )}
            >
              {row.amountFormatted}
            </span>
          </div>
        ))}
      </div>

      <BreakdownDonutChart
        segments={chart.breakdown}
        centerPrimary={chart.centerPercent}
        centerSecondary={chart.centerLabel}
        centerMode="percent"
      >
        <ul className="min-w-0 flex-1 space-y-2.5">
          {chart.breakdown.map((segment) => (
            <li
              key={segment.id}
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="min-w-0 flex-1 text-slate-400">{segment.label}</span>
              <span className="shrink-0 font-semibold text-slate-200">
                {segment.amountFormatted}
              </span>
              <span className="shrink-0 text-slate-500">{segment.percent}%</span>
            </li>
          ))}
        </ul>
      </BreakdownDonutChart>
    </Card>
  );
}
