"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import type { CpaMetricTrend, CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { formatMetricTrend, formatMoney } from "./utils";

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type MetricDef = {
  key: keyof CpaMonthlyFinancialsData["metrics"];
  label: string;
  icon: KPICardData["icon"];
  color: string;
  sparkColor: string;
  invertColor?: boolean;
};

const METRICS: MetricDef[] = [
  { key: "totalRevenue", label: "Total Revenue", icon: "dollar-sign", color: "green", sparkColor: "#22c55e" },
  { key: "cogs", label: "COGS", icon: "bar-chart-3", color: "blue", sparkColor: "#3b82f6" },
  { key: "grossProfit", label: "Gross Profit", icon: "pie-chart", color: "violet", sparkColor: "#a855f7" },
  { key: "totalExpenses", label: "Total Expenses", icon: "trending-down", color: "red", sparkColor: "#ef4444", invertColor: true },
  { key: "netProfit", label: "Net Profit", icon: "handshake", color: "blue", sparkColor: "#3b82f6" },
  { key: "salesTaxCollected", label: "Sales Tax Collected", icon: "percent", color: "amber", sparkColor: "#f97316" },
  { key: "payrollPaid", label: "Payroll Paid", icon: "landmark", color: "blue", sparkColor: "#14b8a6", invertColor: true },
  { key: "commissionsPaid", label: "Commissions Paid", icon: "car", color: "orange", sparkColor: "#f97316" },
];

function toKpiCardData(
  metric: CpaMetricTrend,
  def: MetricDef,
  prevLabel: string,
): KPICardData {
  const trend = formatMetricTrend(metric, prevLabel, def.invertColor);
  return {
    icon: def.icon,
    color: def.color,
    label: def.label,
    value: formatMoney(metric.value),
    delta: trend.text,
    link: "View Details",
    sparkColor: def.sparkColor,
    sparkPoints,
  };
}

export default function CpaMonthlyMetricsStrip({
  data,
  loading,
}: {
  data: CpaMonthlyFinancialsData;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[110px] animate-pulse rounded-sm border border-slate-700 bg-[#0e1626]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
      {METRICS.map((def) => {
        const kpiData = toKpiCardData(data.metrics[def.key], def, data.prevMonthLabel);
        return (
          <KPICard
            key={def.key}
            data={kpiData}
            showLink={false}
            showSparkline={false}
            deltaColor={formatMetricTrend(data.metrics[def.key], data.prevMonthLabel, def.invertColor).positive ? "green" : "red"}
          />
        );
      })}
    </div>
  );
}
