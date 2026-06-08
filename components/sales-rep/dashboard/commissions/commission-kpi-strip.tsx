"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { formatCommissionCurrency } from "@/lib/sales-rep/commissions/format";
import type { ISalesRepCommissionSummary } from "@/lib/sales-rep/commissions/types";

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  summary: ISalesRepCommissionSummary;
  loading?: boolean;
};

export default function CommissionKpiStrip({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-sm border border-slate-700 bg-slate-800/40"
          />
        ))}
      </div>
    );
  }

  const cards: (KPICardData & { valueClassName?: string })[] = [
    {
      icon: "car",
      color: "blue",
      label: "Total Cars Sold",
      value: String(summary.totalCarsSold),
      unit: "This Month",
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "dollar-sign",
      color: "blue",
      label: "Total Commission",
      value: formatCommissionCurrency(summary.totalCommission),
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Paid Commission",
      value: formatCommissionCurrency(summary.paidCommission),
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints,
      valueClassName: "text-emerald-400",
    },
    {
      icon: "tag",
      color: "amber",
      label: "Pending Commission",
      value: formatCommissionCurrency(summary.pendingCommission),
      link: "View Details",
      sparkColor: "#f59e0b",
      sparkPoints,
      valueClassName: "text-amber-400",
    },
    {
      icon: "percent",
      color: "violet",
      label: "Held / Adjustments",
      value: formatCommissionCurrency(summary.heldAdjustments),
      link: "View Details",
      sparkColor: "#a855f7",
      sparkPoints,
      valueClassName: "text-purple-400",
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
          className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm"
        />
      ))}
    </div>
  );
}
