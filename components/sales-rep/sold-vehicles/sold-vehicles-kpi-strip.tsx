"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { formatCommissionCurrency, formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import type { ISalesRepSoldVehicleKpiSummary } from "@/lib/sales-rep/sold-vehicles/types";

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  summary: ISalesRepSoldVehicleKpiSummary;
  loading?: boolean;
};

export default function SoldVehiclesKpiStrip({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse rounded-sm border border-slate-700 bg-slate-800/40"
          />
        ))}
      </div>
    );
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          valueClassName={card.valueClassName}
          className="border-slate-700/80 bg-card backdrop-blur-sm"
        />
      ))}
    </div>
  );
}
