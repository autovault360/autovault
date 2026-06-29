"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, Percent, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import CpaSalesTaxKpiStrip from "./cpa-sales-tax-kpi-strip";
import CpaSalesTaxVehiclesTable from "./cpa-sales-tax-vehicles-table";
import CpaSalesTaxSkeleton from "./cpa-sales-tax-skeleton";
import { useSalesTax } from "./use-sales-tax";

export default function CpaSalesTaxContent() {
  const { data, loading, refresh } = useSalesTax();
  const [exportLoading, setExportLoading] = useState(false);

  const runExport = useCallback(async () => {
    setExportLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Sales tax report export queued");
    setExportLoading(false);
  }, []);

  if (!data && loading) {
    return <CpaSalesTaxSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load sales tax data.
      </div>
    );
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={exportLoading}
        onClick={runExport}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
      >
        {exportLoading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Export Report
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={refresh}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-teal-500/50 hover:text-teal-400"
      >
        {loading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        )}
        Refresh
      </Button>
    </div>
  );

  return (
    <div className="relative">
      {loading && data && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-background pt-32 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-background px-5 py-3 shadow-2xl">
            <Loader2 className="h-5  w-5 animate-spin text-blue-400" />
            <span className="text-sm text-white">Updating data...</span>
          </div>
        </div>
      )}

      <CpaHeader
        title="Sales Tax by Vehicle"
        subtitle="Sales tax collected and remitted, linked to each vehicle."
        titlePrefix={
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Percent className="h-5 w-5" />
          </div>
        }
        showViewMode
        showMonthNav
        actions={headerActions}
      />

      <CpaSalesTaxKpiStrip kpis={data.kpis} />
      <CpaSalesTaxVehiclesTable data={data} loading={loading} />
    </div>
  );
}
