"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import CpaFooter from "@/components/cpa/layout/cpa-footer";
import CpaMonthlyMetricsStrip from "./cpa-monthly-metrics-strip";
import CpaMonthlyTransactionGrid from "./cpa-monthly-transaction-grid";
import CpaMonthlyAnalyticsRow from "./cpa-monthly-analytics-row";
import CpaMonthlyComplianceRow from "./cpa-monthly-compliance-row";
import CpaMonthlyFinancialsSkeleton from "./cpa-monthly-financials-skeleton";
import { useMonthlyFinancials } from "./use-monthly-financials";

export default function CpaMonthlyFinancialsContent() {
  const { data, loading } = useMonthlyFinancials();
  const [exportLoading, setExportLoading] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const runExport = useCallback(async (key: string, message: string) => {
    setExportLoading((prev) => ({ ...prev, [key]: true }));
    await new Promise((r) => setTimeout(r, 800));
    toast.success(message);
    setExportLoading((prev) => ({ ...prev, [key]: false }));
  }, []);

  const handleGeneratePackage = useCallback(async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("CPA package generation started");
    setGenerating(false);
  }, []);

  const handleDownloadReport = useCallback(
    async (id: string, label: string, format: string) => {
      setDownloadingReport(id);
      await new Promise((r) => setTimeout(r, 700));
      toast.success(`${label} ${format.toUpperCase()} requested for download...`);
      setDownloadingReport(null);
    },
    [],
  );

  if (!data && loading) {
    return <CpaMonthlyFinancialsSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load monthly financials data.
      </div>
    );
  }

  const headerActions = (
    <>
      {[
        {
          key: "report",
          label: "Export Report",
          className: "hover:border-blue-500/50 hover:text-blue-400",
          loading: exportLoading.report ?? false,
          onClick: () => runExport("report", "Financial report export queued"),
        },
        {
          key: "excel",
          label: "Export to Excel",
          className: "hover:border-emerald-500/50 hover:text-emerald-400",
          loading: exportLoading.excel ?? false,
          onClick: () => runExport("excel", "Excel export queued"),
        },
        {
          key: "csv",
          label: "Export to CSV",
          className: "hover:border-purple-500/50 hover:text-purple-400",
          loading: exportLoading.csv ?? false,
          onClick: () => runExport("csv", "CSV export queued"),
        },
      ].map((action) => (
        <Button
          key={action.key}
          type="button"
          variant="outline"
          size="sm"
          disabled={action.loading}
          onClick={action.onClick}
          className={cn(
            "border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:bg-slate-800",
            action.className,
          )}
        >
          {action.loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : null}
          {action.label}
        </Button>
      ))}
      <Button
        type="button"
        size="sm"
        disabled={generating}
        onClick={handleGeneratePackage}
        className="bg-blue-600 text-[11px] hover:bg-blue-500"
      >
        {generating ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : null}
        Generate CPA Package
      </Button>
    </>
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-slate-950/60 pt-32 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm text-slate-300">Updating data...</span>
          </div>
        </div>
      )}

      <CpaHeader
        title={`Monthly Financials - ${data.selectedMonth}`}
        subtitle={data.periodSubtitle}
        actions={headerActions}
      />

      <CpaMonthlyMetricsStrip data={data} loading={loading} />
      <CpaMonthlyTransactionGrid data={data} loading={loading} />
      <CpaMonthlyAnalyticsRow data={data} />
      <CpaMonthlyComplianceRow
        data={data}
        downloadingReport={downloadingReport}
        onDownloadReport={handleDownloadReport}
      />

      <CpaFooter />
    </div>
  );
}
