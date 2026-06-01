"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { applyPlFilters } from "@/lib/profit-loss/filter-pl-data";
import { fetchProfitLossReportAction } from "@/lib/profit-loss/server/actions";
import type { PlFilterOptions, PlFilters, PlTab, ProfitLossReport } from "@/lib/profit-loss/types";
import { DEFAULT_PL_FILTERS } from "@/lib/profit-loss/types";
import ProfitLossBreakdownTable from "./profit-loss-breakdown-table";
import ProfitLossCharts from "./profit-loss-charts";
import ProfitLossFilters from "./profit-loss-filters";
import { ProfitLossHeader } from "./profit-loss-header";
import ProfitLossKPICards from "./profit-loss-kpi-cards";
import ProfitLossSummary from "./profit-loss-summary";
import ProfitLossTabs from "./profit-loss-tabs";
import RevenueBreakdownPanel, {
  ExpenseBreakdownPanel,
} from "./revenue-breakdown-panel";
import TrendsPanel from "./trends-panel";

type Props = {
  initialReport: ProfitLossReport;
  filterOptions: PlFilterOptions;
};

function filtersNeedRefetch(prev: PlFilters, next: PlFilters): boolean {
  return (
    prev.dateRange !== next.dateRange ||
    prev.compareTo !== next.compareTo ||
    prev.groupBy !== next.groupBy ||
    prev.salesRep !== next.salesRep ||
    prev.location !== next.location ||
    prev.dealType !== next.dealType
  );
}

export default function ProfitLossPageContent({
  initialReport,
  filterOptions,
}: Props) {
  const [filters, setFilters] = useState<PlFilters>(DEFAULT_PL_FILTERS);
  const [baseReport, setBaseReport] = useState<ProfitLossReport>(initialReport);
  const [activeTab, setActiveTab] = useState<PlTab>("statement");
  const [chartPeriod, setChartPeriod] = useState("this_month");
  const [isPending, startTransition] = useTransition();

  const prevFiltersRef = useRef(filters);

  const handleFiltersChange = useCallback((next: PlFilters) => {
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = next;
    setFilters(next);
    if (filtersNeedRefetch(prev, next)) {
      startTransition(async () => {
        const report = await fetchProfitLossReportAction(next);
        setBaseReport(report);
      });
    }
  }, []);

  const report = useMemo(
    () => applyPlFilters(filters, baseReport),
    [filters, baseReport],
  );

  const trendData = useMemo(() => {
    if (chartPeriod === "last_month" && report.comparisonDailyTrend.length > 0) {
      return report.comparisonDailyTrend;
    }
    return report.dailyTrend;
  }, [chartPeriod, report.comparisonDailyTrend, report.dailyTrend]);

  return (
    <div className="profit-loss-page relative print:bg-white">
      <AdminHeader />

      {isPending && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-blue-500/80 animate-pulse" />
      )}

      <ProfitLossHeader report={report} />

      <ProfitLossFilters
        filters={filters}
        filterOptions={filterOptions}
        onChange={handleFiltersChange}
      />

      <ProfitLossKPICards kpis={report.kpis} />

      <ProfitLossTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "statement" && (
        <div className="grid gap-3.5 xl:grid-cols-[1fr_380px]">
          <ProfitLossBreakdownTable report={report} search={filters.search} />
          <div className="space-y-3.5">
            <ProfitLossCharts
              data={trendData}
              periodValue={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
            <ProfitLossSummary
              insights={report.insights}
              meta={report.meta}
              periodEnd={report.period.end}
            />
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <RevenueBreakdownPanel
          items={report.revenueBreakdown}
          title="Revenue Breakdown"
        />
      )}

      {activeTab === "expense" && (
        <ExpenseBreakdownPanel
          items={report.expenseBreakdown}
          title="Expense Breakdown"
        />
      )}

      {activeTab === "trends" && (
        <TrendsPanel
          data={trendData}
          chartPeriod={chartPeriod}
          onChartPeriodChange={setChartPeriod}
        />
      )}
    </div>
  );
}
