"use client";

import { FileSpreadsheet, FileText, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ReportCardShell({
  children,
  className,
  compact = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Tighter padding for shorter dashboard rows (e.g. row 3). */
  compact?: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col rounded-sm border border-slate-700 bg-transparent text-slate-200 shadow-none",
        compact ? "h-full p-2.5" : "h-full p-3.5",
        className,
      )}
    >
      {children}
    </Card>
  );
}

/** REPORT SUMMARY (This Month) ... title with period subtitle */
export function ReportSummaryTitle({ period = "This Month" }: { period?: string }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
      REPORT SUMMARY{" "}
      <span className="font-semibold normal-case tracking-normal text-slate-500">
        ({period})
      </span>
    </h2>
  );
}

/** Header with title left and blue View Full Report link right */
export function ReportCardHeaderWithLink({
  title,
  linkLabel = "View Full Report",
  className,
  compact = false,
}: {
  title: string;
  linkLabel?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-2 gap-y-1",
        compact ? "mb-1" : "mb-2",
        className,
      )}
    >
      <h2 className="text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        {title}
      </h2>
      <button
        type="button"
        className="shrink-0 text-[11px] font-medium text-blue-400 hover:text-blue-300"
      >
        {linkLabel} →
      </button>
    </div>
  );
}

export function ReportCardSubtitle({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        "leading-snug text-slate-500",
        compact ? "mb-1.5 text-[10px]" : "mb-2.5 text-[13px]",
      )}
    >
      {children}
    </p>
  );
}

/** Title with (period) inline and optional link ... e.g. EXPENSE REPORT (This Month) */
export function ReportTitleWithPeriodAndLink({
  title,
  period = "This Month",
  showLink = true,
  linkLabel = "View Full Report",
}: {
  title: string;
  period?: string;
  showLink?: boolean;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2 flex items-start justify-between gap-2">
      <h2 className="text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        {title}{" "}
        <span className="font-semibold normal-case tracking-normal text-slate-500">
          ({period})
        </span>
      </h2>
      {showLink && (
        <button
          type="button"
          className="shrink-0 pt-px text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          {linkLabel} →
        </button>
      )}
    </div>
  );
}

export function ReportSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">
      {children}
    </h3>
  );
}

export function ReportExportButtonsRow({
  excelOnly = false,
  centered = false,
}: {
  excelOnly?: boolean;
  centered?: boolean;
}) {
  const pdfBtn = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#0e1626] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-slate-600"
    >
      <FileText className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
      Export PDF
    </button>
  );
  const excelBtn = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#0e1626] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-slate-600"
    >
      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
      Export Excel
    </button>
  );

  if (excelOnly) {
    return (
      <div
        className={cn(
          "mt-auto pt-3",
          centered ? "flex justify-center" : "flex flex-wrap gap-2",
        )}
      >
        {excelBtn}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap gap-2",
        centered && "justify-center",
      )}
    >
      {pdfBtn}
      {excelBtn}
    </div>
  );
}

export function ReportCardHead({
  title,
  pill,
  info,
}: {
  title: string;
  pill?: string;
  info?: boolean;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {title}
        {info && <Info className="h-3 w-3" />}
      </div>
      {pill && (
        <Select defaultValue={pill}>
          <SelectTrigger className="h-7 border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-[#0e1626] text-[11px] text-slate-300">
            <SelectItem value="This Month">This Month</SelectItem>
            <SelectItem value="Last Month">Last Month</SelectItem>
            <SelectItem value="This Quarter">This Quarter</SelectItem>
            <SelectItem value="This Year">This Year</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function ReportMetricRows({
  rows,
}: {
  rows: { label: string; value: string; tone?: "positive" | "negative" | "neutral" }[];
}) {
  return (
    <ul className="border-y border-slate-800/60">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex items-center justify-between gap-3 border-b border-slate-800/50 px-0.5 py-2.5 text-[11.5px] last:border-0"
        >
          <span className="text-slate-400">{row.label}</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              row.tone === "positive"
                ? "text-emerald-400"
                : row.tone === "negative"
                  ? "text-red-400"
                  : "text-slate-200",
            )}
          >
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ReportSummaryFooter() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
      >
        View Full Report ...
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#0e1626] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-slate-600"
        >
          <FileText className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
          Export PDF
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#0e1626] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-slate-600"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
          Export Excel
        </button>
      </div>
    </div>
  );
}

export function ReportViewMore({
  label,
  compact = false,
  className,
}: {
  label: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full shrink-0 rounded-b-sm border-t border-slate-700 bg-transparent text-center font-medium text-blue-400 hover:bg-slate-800/30",
        compact
          ? "mt-2 -mx-2.5 -mb-2.5 w-[calc(100%+1.25rem)] py-2 text-[11px]"
          : "mt-auto -mx-3.5 -mb-3.5 w-[calc(100%+1.75rem)] py-2.5 text-[11.5px]",
        className,
      )}
    >
      {label} →
    </button>
  );
}

export function ReportDot({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "mr-1.5 inline-block h-2 w-2 rounded-full align-middle",
        className,
      )}
    />
  );
}
