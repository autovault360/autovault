"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import type { ISalesRepSoldVehicleKpiSummary } from "@/lib/sales-rep/sold-vehicles/types";

const CARD_COUNT = 5;

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  summary: ISalesRepSoldVehicleKpiSummary;
  loading?: boolean;
};

export default function SoldVehiclesKpiStrip({ summary, loading }: Props) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards: (KPICardData & { valueClassName?: string })[] = [
    {
      icon: "car",
      color: "blue",
      label: "Vehicles Sold",
      value: String(summary.vehiclesSold),
      unit: "This Month",
      delta: summary.vehiclesSoldTrend,
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Gross Profit",
      value: formatCommissionPrice(summary.grossProfit),
      unit: "This Month",
      delta: summary.grossProfitTrend,
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints,
      valueClassName: "text-white",
    },
    {
      icon: "percent",
      color: "violet",
      label: "Commission Earned",
      value: formatCommissionCurrency(summary.commissionEarned),
      unit: "This Month",
      delta: summary.commissionTrend,
      link: "View Details",
      sparkColor: "#a855f7",
      sparkPoints,
      valueClassName: "text-purple-400",
    },
    {
      icon: "bar-chart-3",
      color: "orange",
      label: "Avg Gross Profit",
      value: formatCommissionPrice(summary.avgGrossProfit),
      unit: "Per Vehicle",
      delta: summary.avgGrossProfitTrend,
      link: "View Details",
      sparkColor: "#f97316",
      sparkPoints,
    },
    {
      icon: "badge-check",
      color: "amber",
      label: "Closing Rate",
      value: `${summary.closingRate}%`,
      unit: "This Month",
      delta: summary.closingRateTrend,
      link: "View Details",
      sparkColor: "#eab308",
      sparkPoints,
    },
  ];

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          valueClassName={card.valueClassName}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
