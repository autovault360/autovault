"use client";

import { FileText, Sheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import CpaDealJacketDonut from "@/components/cpa/dashboard/cpa-deal-jacket-donut";
import CpaFilesWidget from "@/components/cpa/dashboard/cpa-files-widget";
import CpaNotesPreview from "@/components/cpa/dashboard/cpa-notes-preview";
import { cn } from "@/lib/utils";
import type { CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { mapMonthlyNotesToPreview } from "./utils";

export default function CpaMonthlyComplianceRow({
  data,
  downloadingReport,
  onDownloadReport,
}: {
  data: CpaMonthlyFinancialsData;
  downloadingReport: string | null;
  onDownloadReport: (id: string, label: string, format: string) => void;
}) {
  const dealSegments = data.dealJackets.segments.map((s) => ({
    name: s.name,
    value: s.pct,
    color: s.color,
    count: s.count,
  }));

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 xl:grid-cols-4">
      <CardShell>
        <CardHead title={`DEAL JACKET STATUS (${data.selectedMonth.toUpperCase()})`} />
        <CpaDealJacketDonut
          segments={dealSegments}
          total={data.dealJackets.total}
          bare
        />
      </CardShell>

      <CardShell>
        <CpaNotesPreview
          notes={mapMonthlyNotesToPreview(data.notes)}
          bare
          addLabel="Add Note"
          hideFooter
        />
      </CardShell>

      <CardShell>
        <CardHead title="FILES & STORAGE" />
        <CpaFilesWidget folders={data.storageFolders} bare />
      </CardShell>

      <CardShell>
        <CardHead title="REPORTS & EXPORTS" />
        <div className="grid grid-cols-2 gap-2">
          {data.reportExports.map((report) => {
            const isPdf = report.format === "pdf";
            const Icon = isPdf ? FileText : Sheet;
            const isLoading = downloadingReport === report.id;
            return (
              <button
                key={report.id}
                type="button"
                disabled={isLoading}
                onClick={() => onDownloadReport(report.id, report.label, report.format)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border border-slate-800 bg-[#060d18] p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                  isPdf
                    ? "hover:border-red-500/50 hover:bg-red-500/10"
                    : "hover:border-emerald-500/50 hover:bg-emerald-500/10",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isPdf ? "text-red-400" : "text-emerald-400",
                    )}
                  />
                )}
                <span className="text-center text-[9px] text-slate-400">{report.label}</span>
              </button>
            );
          })}
        </div>
      </CardShell>
    </div>
  );
}
