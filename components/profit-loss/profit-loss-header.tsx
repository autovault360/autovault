"use client";

import Link from "next/link";
import { Download, FileSpreadsheet, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfitLossReport } from "@/lib/profit-loss/types";
import { downloadPlCsv, downloadPlExcel, exportPlPdf } from "@/lib/profit-loss/export-pl";
import { toast } from "sonner";

type Props = {
  report: ProfitLossReport;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
};

export function useProfitLossExport(report: ProfitLossReport) {
  return {
    exportPdf: () => exportPlPdf(),
    exportExcel: () => downloadPlExcel(report),
    exportCsv: () => downloadPlCsv(report),
    sendToCpa: () => toast.success("Report queued to send to CPA"),
  };
}

export default function ProfitLossExportActions({
  report,
  onExportPdf,
  onExportExcel,
  onExportCsv,
}: Props) {
  const handlers = useProfitLossExport(report);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onExportPdf ?? handlers.exportPdf}
        className="h-9 gap-1.5 border-slate-700 bg-transparent px-3.5 text-[11.5px] font-medium text-slate-300 hover:bg-slate-800/50"
      >
        <Download className="h-3.5 w-3.5" />
        Export PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onExportExcel ?? handlers.exportExcel}
        className="h-9 gap-1.5 border-slate-700 bg-transparent px-3.5 text-[11.5px] font-medium text-slate-300 hover:bg-slate-800/50"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Export Excel
      </Button>
    </>
  );
}

type HeaderProps = {
  report: ProfitLossReport;
};

export function ProfitLossHeaderActions({ report }: HeaderProps) {
  const { exportPdf, exportExcel, sendToCpa } = useProfitLossExport(report);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/dashboard/deal-jackets"
        className="flex h-9 items-center rounded-md border border-slate-700 bg-transparent px-3.5 text-[11.5px] font-medium text-slate-300 hover:bg-slate-800/50"
      >
        View Sold Vehicles ({report.soldVehicleCount})
      </Link>
      <Link
        href="/dashboard/expenses"
        className="flex h-9 items-center rounded border border-slate-700 bg-transparent px-3.5 text-[11.5px] font-medium text-slate-300 hover:bg-slate-800/50"
      >
        View Expense Details
      </Link>
      <Button
        theme="dark"
        type="button"
        variant="outline"
        size="lg"
        onClick={exportPdf}
      >
        <Download className="h-3.5 w-3.5" />
        Export PDF
      </Button>
      <Button
        theme="dark"
        type="button"
        variant="outline"
        size="lg"
        onClick={exportExcel}
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Export Excel
      </Button>
      <Button
        theme="dark"
        type="button"
        size="lg"
        onClick={sendToCpa}
      >
        <Send className="h-3.5 w-3.5" />
        Send to CPA
      </Button>
    </div>
  );
}

export function ProfitLossHeader({ report }: HeaderProps) {
  return (
    <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Profit & Loss</h1>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[13px] font-medium text-emerald-400">
            Auto-Generated
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Automatically generated from your sales, expenses, and operational data.
        </p>
      </div>
      <ProfitLossHeaderActions report={report} />
    </section>
  );
}
