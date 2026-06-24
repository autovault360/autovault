"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import { downloadVehicleLossesCsv } from "@/lib/cpa/vehicle-losses-report/export-vehicle-losses";
import type { CpaLossTab } from "@/lib/cpa/vehicle-losses-report/types";
import {
  buildLossBreakdown,
  buildLossByReason,
  buildLossByVehicleType,
  buildLossKpis,
  filterVehiclesByTab,
} from "@/lib/cpa/vehicle-losses-report/utils";
import CpaVehicleLossesReportChartsRow from "@/components/cpa/vehicle-losses-report/cpa-vehicle-losses-report-charts-row";
import CpaVehicleLossesReportKpiStrip from "@/components/cpa/vehicle-losses-report/cpa-vehicle-losses-report-kpi-strip";
import CpaVehicleLossesReportSkeleton from "@/components/cpa/vehicle-losses-report/cpa-vehicle-losses-report-skeleton";
import CpaVehicleLossesReportTableSection from "@/components/cpa/vehicle-losses-report/cpa-vehicle-losses-report-table-section";
import type { CpaVehicleLossesReportData } from "@/lib/cpa/vehicle-losses-report/types";

export default function VehicleLossesReportPage({
  data,
}: {
  data: CpaVehicleLossesReportData | null;
}) {
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

  if (!data) {
    return <CpaVehicleLossesReportSkeleton />;
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
    <div className="space-y-4">
      <section className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <PageHeaderTitle
          title="Vehicle Losses Report"
          subtitle="All vehicles sold at a loss, returned to auction, or with negative profit."
        />
        {headerActions}
      </section>

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
      />
    </div>
  );
}
