"use client";

import { ExternalLink, FileDown, Loader2, Printer, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ReportsDrilldownPayload } from "@/lib/reports-reminders/types";

type Props = {
  open: boolean;
  loading: boolean;
  error?: string | null;
  payload?: ReportsDrilldownPayload | null;
  onOpenChange: (open: boolean) => void;
};

const actionIcon = {
  export: FileDown,
  print: Printer,
  mutate: SlidersHorizontal,
  link: ExternalLink,
};

export default function ReportsDetailSheet({
  open,
  loading,
  error,
  payload,
  onOpenChange,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-slate-700 bg-[#06101f] p-0 text-slate-200 sm:max-w-3xl"
      >
        <SheetHeader className="border-b border-slate-800 px-5 py-4 pr-12 text-left">
          <SheetTitle className="text-base font-bold text-white">
            {payload?.title ?? "Report Details"}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            {payload?.description ?? "Loading report data..."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid min-h-[280px] place-items-center text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading drill-down data
              </span>
            </div>
          ) : error ? (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : payload ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {payload.periodLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  {payload.actions.map((action) => {
                    const Icon = actionIcon[action.kind ?? "link"];
                    const content = (
                      <>
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </>
                    );
                    if (action.href) {
                      return (
                        <a key={action.id} href={action.href} target="_blank" rel="noreferrer">
                          <Button type="button" size="sm" variant="outline" className="h-8 border-slate-700 bg-[#0e1626] text-xs text-slate-200 hover:bg-slate-800">
                            {content}
                          </Button>
                        </a>
                      );
                    }
                    return (
                      <Button
                        key={action.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => action.kind === "print" && window.print()}
                        className="h-8 border-slate-700 bg-[#0e1626] text-xs text-slate-200 hover:bg-slate-800"
                      >
                        {content}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {payload.metrics.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {payload.metrics.map((metric) => (
                    <div key={metric.label} className="rounded border border-slate-800 bg-[#0b1324] p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        {metric.label}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-lg font-bold tabular-nums",
                          metric.tone === "negative"
                            ? "text-red-400"
                            : metric.tone === "neutral"
                              ? "text-slate-200"
                              : "text-emerald-400",
                        )}
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {payload.rows.length === 0 ? (
                <div className="rounded border border-slate-800 bg-[#0b1324] p-6 text-center text-sm text-slate-400">
                  {payload.emptyMessage}
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-slate-800">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-[#0b1324] text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        {payload.columns.map((column) => (
                          <th
                            key={column.key}
                            className={cn(
                              "border-b border-slate-800 px-3 py-2 font-semibold",
                              column.align === "right" ? "text-right" : "text-left",
                            )}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payload.rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-800/70 last:border-0">
                          {payload.columns.map((column, index) => (
                            <td
                              key={column.key}
                              className={cn(
                                "px-3 py-2.5 text-slate-300",
                                column.align === "right" ? "text-right tabular-nums" : "text-left",
                              )}
                            >
                              {index === 0 && row.href ? (
                                <a href={row.href} className="font-medium text-blue-400 hover:text-blue-300">
                                  {row.values[column.key]}
                                </a>
                              ) : (
                                row.values[column.key]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-right text-[11px] text-slate-500">
                Showing {payload.rows.length} of {payload.pagination.total} records
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
