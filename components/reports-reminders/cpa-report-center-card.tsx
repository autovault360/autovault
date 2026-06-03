"use client";

import {
  Calculator,
  CalendarClock,
  CarFront,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Mail,
  ScrollText,
  Warehouse,
} from "lucide-react";
import {
  ReportCardShell,
  ReportCardSubtitle,
} from "./report-card-primitives";

const CPA_TILES = [
  { id: "pl", label: "P&L Remit Report", Icon: ScrollText },
  { id: "expense", label: "Expense Summary", Icon: ClipboardList },
  { id: "payroll", label: "Payroll Summary", Icon: Calculator },
  { id: "sales_tax", label: "Sales Tax Summary", Icon: CalendarClock },
  { id: "vehicle_sales", label: "Vehicle Sales Report", Icon: CarFront },
  { id: "inventory", label: "Inventory Report", Icon: Warehouse },
] as const;

export default function CpaReportCenterCard() {
  return (
    <ReportCardShell compact className="flex h-full flex-col">
      <h2 className="text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        CPA REPORT CENTER
      </h2>
      <ReportCardSubtitle compact>One-click reports for your CPA</ReportCardSubtitle>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="grid shrink-0 grid-cols-6 gap-1">
        {CPA_TILES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className="flex min-w-0 flex-col items-center gap-0.5 rounded border border-slate-600/80 bg-[#0e1626] px-0.5 py-1.5 transition hover:border-slate-500"
          >
            <Icon className="h-4 w-4 shrink-0 text-slate-200" strokeWidth={1.5} />
            <span className="text-center text-[6.5px] leading-[1.15] text-slate-400">
              {label}
            </span>
          </button>
        ))}
        </div>
      </div>

      <div className="mt-auto flex shrink-0 gap-1">
        <button
          type="button"
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded border border-slate-700 bg-[#0e1626] px-1 py-1 text-[8.5px] font-medium text-slate-200 transition hover:border-slate-600"
        >
          <FileText className="h-2.5 w-2.5 shrink-0 text-red-500" strokeWidth={2} />
          <span className="truncate">Export All (PDF)</span>
        </button>
        <button
          type="button"
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded border border-slate-700 bg-[#0e1626] px-1 py-1 text-[8.5px] font-medium text-slate-200 transition hover:border-slate-600"
        >
          <FileSpreadsheet
            className="h-2.5 w-2.5 shrink-0 text-emerald-500"
            strokeWidth={2}
          />
          <span className="truncate">Export All (Excel)</span>
        </button>
        <button
          type="button"
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded border border-blue-600 bg-blue-600 px-1 py-1 text-[8.5px] font-medium text-white transition hover:bg-blue-500"
        >
          <Mail className="h-2.5 w-2.5 shrink-0 text-white" strokeWidth={2} />
          <span className="truncate">Email to CPA</span>
        </button>
      </div>
    </ReportCardShell>
  );
}
