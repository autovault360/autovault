"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import { downloadProfitVehiclesCsv } from "@/lib/cpa/profit-vehicles-report/export-profit-vehicles";
import CpaProfitVehiclesReportChartsRow from "./cpa-profit-vehicles-report-charts-row";
import CpaProfitVehiclesReportKpiStrip from "./cpa-profit-vehicles-report-kpi-strip";
import CpaProfitVehiclesReportSkeleton from "./cpa-profit-vehicles-report-skeleton";
import CpaProfitVehiclesReportTableSection from "./cpa-profit-vehicles-report-table-section";
import { useProfitVehiclesReport } from "./use-profit-vehicles-report";

export default function CpaProfitVehiclesReportContent() {
  const { data, loading } = useProfitVehiclesReport();
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const exportFilename = useMemo(() => {
    if (!data) return "profit-vehicles-report.csv";
    const slug = data.periodLabel.replace(/\s+/g, "-").toLowerCase();
    return `profit-vehicles-report-${slug}.csv`;
  }, [data]);

  const runExport = useCallback(
    async (format: "PDF" | "Excel") => {
      if (!data) return;

      setExportLoading(format);
      try {
        if (format === "Excel") {
          downloadProfitVehiclesCsv(data.vehicles, exportFilename);
          toast.success("Profit vehicles report exported to Excel");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 700));
          toast.success("PDF export queued");
        }
      } finally {
        setExportLoading(null);
      }
    },
    [data, exportFilename],
  );

  if (!data && loading) {
    return <CpaProfitVehiclesReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load profit vehicles report data.
      </div>
    );
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={exportLoading === "PDF"}
        onClick={() => runExport("PDF")}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
      >
        {exportLoading === "PDF" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Export PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={exportLoading === "Excel"}
        onClick={() => runExport("Excel")}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400"
      >
        {exportLoading === "Excel" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Export Excel
      </Button>
    </div>
  );

  return (
    <>
      <CpaHeader
        title="Profit Vehicles Report"
        subtitle="All vehicles sold at a profit."
        showViewMode
        showMonthNav
        actions={headerActions}
      />

      <CpaProfitVehiclesReportKpiStrip kpis={data.kpis} />

      <CpaProfitVehiclesReportChartsRow
        profitBreakdown={data.profitBreakdown}
        profitBreakdownTotal={data.profitBreakdownTotal}
        profitBySource={data.profitBySource}
        profitByVehicleType={data.profitByVehicleType}
      />

      <CpaProfitVehiclesReportTableSection
        vehicles={data.vehicles}
        makeOptions={data.makeOptions}
        vehicleTypeOptions={data.vehicleTypeOptions}
        loading={loading}
      />
    </>
  );
}
