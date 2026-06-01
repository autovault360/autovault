"use client";

import ProfitLossCharts from "./profit-loss-charts";
import type { PlTrendPoint } from "@/lib/profit-loss/types";

type Props = {
  data: PlTrendPoint[];
  chartPeriod: string;
  onChartPeriodChange: (value: string) => void;
};

export default function TrendsPanel({
  data,
  chartPeriod,
  onChartPeriodChange,
}: Props) {
  return (
    <div className="space-y-3.5">
      <ProfitLossCharts
        data={data}
        title="Monthly Trend (Net Profit)"
        height={320}
        periodValue={chartPeriod}
        onPeriodChange={onChartPeriodChange}
      />
      <ProfitLossCharts
        data={data}
        title="Cumulative Net Profit"
        height={280}
        showPeriodSelect={false}
      />
    </div>
  );
}
