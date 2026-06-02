"use client";

import YearlyPerformanceMatrix from "./yearly-performance-matrix";
import YearlyRightSummary from "./yearly-right-summary";
import YearlyBottomCharts from "./yearly-bottom-charts";
import MonthlyPerformanceSummaryView from "./monthly-performance-summary-view";
import type { FilteredCalendarReport, MonthlyPerformanceSummary } from "@/lib/calendar/types";
import type {
  BestMonthEntry,
  MonthlyTrendPoint,
  QuarterlyMetric,
  SalesRepLeaderboardEntry,
} from "@/lib/calendar/types";

type Props = {
  year: number;
  report: FilteredCalendarReport;
  selectedMonthId: string | null;
  monthSummary: MonthlyPerformanceSummary | null;
  yearSummary: {
    unitsSold: number;
    totalGross: number;
    totalCommissions: number;
    avgGrossPerUnit: number;
    avgCommissionPerUnit: number;
  };
  topReps: SalesRepLeaderboardEntry[];
  bestMonths: BestMonthEntry[];
  quarterlyBars: QuarterlyMetric[];
  monthlyTrend: MonthlyTrendPoint[];
  monthlyCommissions: MonthlyTrendPoint[];
  onMonthSelect: (monthId: string) => void;
  onMonthSummaryClose: () => void;
};

export default function YearlyCalendarView({
  year,
  report,
  selectedMonthId,
  monthSummary,
  yearSummary,
  topReps,
  bestMonths,
  quarterlyBars,
  monthlyTrend,
  monthlyCommissions,
  onMonthSelect,
  onMonthSummaryClose,
}: Props) {
  return (
    <>
      <section className="mb-3.5 grid gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <YearlyPerformanceMatrix
            year={year}
            report={report}
            selectedMonthId={selectedMonthId}
            onMonthSelect={onMonthSelect}
          />
        </div>
        <div className="xl:col-span-4">
          <YearlyRightSummary
            yearSummary={yearSummary}
            topReps={topReps}
            bestMonths={bestMonths}
            yearlyEvents={report.yearlyEvents}
          />
        </div>
      </section>

      {monthSummary && (
        <MonthlyPerformanceSummaryView
          summary={monthSummary}
          onClose={onMonthSummaryClose}
        />
      )}

      <YearlyBottomCharts
        quarterlyBars={quarterlyBars}
        monthlyTrend={monthlyTrend}
        monthlyCommissions={monthlyCommissions}
      />
    </>
  );
}
