"use client";

import { ChevronDown } from "lucide-react";
import type { CustomReportField } from "@/lib/reports-reminders/types";
import {
  ReportCardShell,
  ReportCardSubtitle,
} from "./report-card-primitives";

type Props = {
  fields: CustomReportField[];
  onOpen?: () => void;
};

export default function CustomReportBuilderCard({ fields, onOpen }: Props) {
  return (
    <ReportCardShell compact className="flex h-full flex-col" onClick={onOpen}>
      <h2 className="text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        CUSTOM REPORT BUILDER
      </h2>
      <ReportCardSubtitle compact>
        Create custom reports with your data
      </ReportCardSubtitle>

      <div className="shrink-0 space-y-1">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-2"
          >
            <span className="shrink-0 text-[10px] text-slate-400">
              {field.label}
            </span>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-6 w-[58%] max-w-[9.5rem] items-center justify-between gap-1 rounded border border-slate-700 bg-[#0e1626] px-1.5 text-[10px] text-slate-200"
            >
              <span className="truncate">{field.value}</span>
              <ChevronDown className="h-2.5 w-2.5 shrink-0 text-slate-500" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen?.();
        }}
        className="mt-auto shrink-0 w-full rounded bg-blue-600 py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-blue-500"
      >
        Generate Report
      </button>
    </ReportCardShell>
  );
}
