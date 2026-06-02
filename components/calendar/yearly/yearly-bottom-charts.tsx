"use client";

import { formatCompactCurrency } from "@/lib/profit-loss/types";
import type { MonthlyTrendPoint, QuarterlyMetric } from "@/lib/calendar/types";
import {
  CalendarCommissionsAreaChart,
  CalendarMetricLineChart,
  QuarterlyPerformanceBarChart,
} from "../charts/calendar-metric-line-chart";

type Props = {
  quarterlyBars: QuarterlyMetric[];
  monthlyTrend: MonthlyTrendPoint[];
  monthlyCommissions: MonthlyTrendPoint[];
};

export default function YearlyBottomCharts({
  quarterlyBars,
  monthlyTrend,
  monthlyCommissions,
}: Props) {
  return (
    <section className="mt-3.5 grid gap-3.5 xl:grid-cols-4">
      <QuarterlyPerformanceBarChart
        title="Units Sold By Quarter"
        data={quarterlyBars.map((q) => ({ quarter: q.quarter, value: q.units }))}
        barColor="#3B82F6"
      />
      <QuarterlyPerformanceBarChart
        title="Gross Profit By Quarter"
        data={quarterlyBars.map((q) => ({ quarter: q.quarter, value: q.gross }))}
        barColor="#10B981"
        valueFormatter={formatCompactCurrency}
      />
      <CalendarMetricLineChart
        title="Monthly Trend (Units vs Gross)"
        data={monthlyTrend}
        lines={[
          { key: "units", color: "#3B82F6", name: "Units Sold", yAxisId: "left" },
          { key: "gross", color: "#10B981", name: "Gross", yAxisId: "right" },
        ]}
        height={180}
      />
      <CalendarCommissionsAreaChart
        title="Monthly Commissions"
        data={monthlyCommissions.map((m) => ({
          label: m.label,
          commission: m.commission,
        }))}
        height={180}
      />
    </section>
  );
}
