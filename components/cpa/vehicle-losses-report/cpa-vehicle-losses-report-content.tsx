"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import { downloadVehicleLossesCsv } from "@/lib/cpa/vehicle-losses-report/export-vehicle-losses";
import type { CpaLossTab } from "@/lib/cpa/vehicle-losses-report/types";
import {
  buildLossBreakdown,
  buildLossByReason,
  buildLossByVehicleType,
  buildLossKpis,
  filterVehiclesByTab,
} from "@/lib/cpa/vehicle-losses-report/utils";
import CpaVehicleLossesReportChartsRow from "./cpa-vehicle-losses-report-charts-row";
import CpaVehicleLossesReportKpiStrip from "./cpa-vehicle-losses-report-kpi-strip";
import CpaVehicleLossesReportSkeleton from "./cpa-vehicle-losses-report-skeleton";
import CpaVehicleLossesReportTableSection from "./cpa-vehicle-losses-report-table-section";
import { useVehicleLossesReport } from "./use-vehicle-losses-report";

export default function CpaVehicleLossesReportContent() {
  const { data, loading } = useVehicleLossesReport();
  const [activeTab, setActiveTab] = useState<CpaLossTab>("all");
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const tabVehicles = useMemo(
    () => (data ? filterVehiclesByTab(data.vehicles, activeTab) : []),
    [data, activeTab],
  );

  const kpis = useMemo(() => buildLossKpis(tabVehicles), [tabVehicles]);
  const breakdown = useMemo(() => buildLossBreakdown(tabVehicles), [tabVehicles]);
  const lossByReason = useMemo(() => buildLossByReason(tabVehicles), [tabVehicles]);
  const lossByVehicleType = useMemo(
    () => buildLossByVehicleType(tabVehicles),
    [tabVehicles],
  );

  const exportFilename = useMemo(() => {
    if (!data) return "vehicle-losses-report.csv";
    const slug = data.periodLabel.replace(/\s+/g, "-").toLowerCase();
    return `vehicle-losses-report-${slug}.csv`;
  }, [data]);

  const runExport = useCallback(
    async (format: "PDF" | "Excel") => {
      if (!data) return;

      setExportLoading(format);
      try {
        if (format === "Excel") {
          downloadVehicleLossesCsv(tabVehicles, exportFilename);
          toast.success("Vehicle losses report exported to Excel");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 700));
          toast.success("PDF export queued");
        }
      } finally {
        setExportLoading(null);
      }
    },
    [data, exportFilename, tabVehicles],
  );

  if (!data && loading) {
    return <CpaVehicleLossesReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load vehicle losses report data.
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
        title="Vehicle Losses Report"
        subtitle="All vehicles sold at a loss, returned to auction, or with negative profit."
        showViewMode
        showMonthNav
        actions={headerActions}
      />

      <CpaVehicleLossesReportKpiStrip kpis={kpis} />

      <CpaVehicleLossesReportChartsRow
        lossBreakdown={breakdown.segments}
        lossBreakdownTotal={breakdown.total}
        lossByReason={lossByReason}
        lossByVehicleType={lossByVehicleType}
      />

      <CpaVehicleLossesReportTableSection
        vehicles={tabVehicles}
        makeOptions={data.makeOptions}
        vehicleTypeOptions={data.vehicleTypeOptions}
        lossReasonOptions={data.lossReasonOptions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dataAsOf={data.dataAsOf}
        loading={loading}
      />
    </>
  );
}
