"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import type { CpaMetricTrend, CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { formatMetricTrend, formatMoney } from "./utils";

const CARD_COUNT = 8;

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
    return <KpiGridSkeleton count={CARD_COUNT} className="mb-3.5" />;
  }

  return (
    <div className={kpiGridClass(CARD_COUNT, "mb-3.5")}>
      {METRICS.map((def) => {
        const kpiData = toKpiCardData(data.metrics[def.key], def, data.prevMonthLabel);
        return (
          <KPICard
            key={def.key}
            data={kpiData}
            {...KPI_CARD_DEFAULT_PROPS}
            deltaColor={
              formatMetricTrend(data.metrics[def.key], data.prevMonthLabel, def.invertColor).positive
                ? "green"
                : "red"
            }
            className={KPI_CARD_SHELL_CLASS}
          />
        );
      })}
    </div>
  );
}
