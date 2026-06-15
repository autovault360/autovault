"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { formatCommissionCurrency } from "@/lib/sales-rep/commissions/format";
import type { ISalesRepCommissionSummary } from "@/lib/sales-rep/commissions/types";

const CARD_COUNT = 5;

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  summary: ISalesRepCommissionSummary;
  loading?: boolean;
};

export default function CommissionKpiStrip({ summary, loading }: Props) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
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
