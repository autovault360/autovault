"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import CpaExpensesKpiStrip from "@/components/cpa/expenses/cpa-expenses-kpi-strip";
import CpaExpensesChartsRow from "@/components/cpa/expenses/cpa-expenses-charts-row";
import CpaExpensesTableSection from "@/components/cpa/expenses/cpa-expenses-table-section";
import CpaExpensesSkeleton from "@/components/cpa/expenses/cpa-expenses-skeleton";
import type { CpaExpensesPageData } from "@/lib/cpa/expenses/types";

export default function ExpensesPage({
  data,
  loading,
  onRefresh,
}: {
  data: CpaExpensesPageData | null;
  loading?: boolean;
  onRefresh?: () => void;
}) {
  const [exportLoading, setExportLoading] = useState(false);

  const runExport = useCallback(async () => {
    setExportLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Expense report export queued");
    setExportLoading(false);
  }, []);

  if (!data && loading) {
    return <CpaExpensesSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load expense data.
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
      {onRefresh ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onRefresh}
          className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-teal-500/50 hover:text-teal-400"
        >
          {loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="relative space-y-4">
      {loading && data ? (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-background pt-32 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-background px-5 py-3 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm text-white">Updating data...</span>
          </div>
        </div>
      ) : null}

      <section className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <PageHeaderTitle
          title="Expense Category Report"
          subtitle="All expenses for the selected period."
        />
        {headerActions}
      </section>

      <CpaExpensesKpiStrip kpis={data.kpis} />
      <CpaExpensesChartsRow
        categories={data.categories}
        breakdownTotal={data.breakdownTotal}
        trend={data.trend}
      />
      <CpaExpensesTableSection data={data} loading={!!loading} />
    </div>
  );
}
