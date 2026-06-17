"use client";

import type { ExpenseBarRow } from "@/lib/reports-reminders/types";
import {
  ReportCardShell,
  ReportExportButtonsRow,
  ReportSectionLabel,
  ReportTitleWithPeriodAndLink,
} from "./report-card-primitives";

const CHART_MAX = 4000;

const AXIS_LABELS = ["$0", "$1K", "$2K", "$3K", "$4K"];

type Props = {
  bars: ExpenseBarRow[];
  period?: string;
  onOpen?: () => void;
};

export default function ExpenseReportCard({ bars, period = "This Month", onOpen }: Props) {
  return (
    <ReportCardShell className="flex flex-col" onClick={onOpen}>
      <ReportTitleWithPeriodAndLink title="EXPENSE REPORT" period={period} onClick={onOpen} />
      <ReportSectionLabel>Expenses by Category</ReportSectionLabel>

      <div className="min-h-0 flex-1 space-y-1.5">
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="grid grid-cols-[minmax(0,5.5rem)_1fr_auto] items-center gap-x-1.5 gap-y-0"
          >
            <span className="truncate text-[10px] leading-tight text-slate-400">
              {bar.label}
            </span>
            <div className="h-2 overflow-hidden rounded-sm bg-slate-800/90">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${Math.min(100, (bar.amount / CHART_MAX) * 100)}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
            <span className="shrink-0 text-right text-[10px] tabular-nums text-slate-300">
              ${bar.amount.toLocaleString()}{" "}
              <span className="text-slate-500">
                ({bar.percent.toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between px-0.5 text-[9px] text-slate-600">
        {AXIS_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <ReportExportButtonsRow onExport={onOpen} />
    </ReportCardShell>
  );
}
