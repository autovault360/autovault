"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { formatCurrency } from "@/lib/deal-jackets/types";
import type { SalesRepDealJacketKpiSummary } from "@/lib/sales-rep/deal-jacket/types";

const CARD_COUNT = 5;

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  summary: SalesRepDealJacketKpiSummary;
  loading?: boolean;
};

export default function SalesRepDealJacketKpiStrip({
  summary,
  loading,
}: Props) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards = [
    {
      icon: "bar-chart-3" as const,
      color: "blue",
      label: "Total Deal Jackets",
      value: String(summary.total),
      unit: "All Deals",
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "circle-alert" as const,
      color: "amber",
      label: "Pending Approval",
      value: String(summary.pendingReview),
      unit: "Awaiting Review",
      link: "",
      sparkColor: "#f59e0b",
      sparkPoints,
    },
    {
      icon: "refresh-cw" as const,
      color: "orange",
      label: "Changes Requested",
      value: String(summary.changesRequested + summary.resubmitted),
      unit: "Needs Attention",
      link: "",
      sparkColor: "#f97316",
      sparkPoints,
    },
    {
      icon: "badge-check" as const,
      color: "green",
      label: "Approved",
      value: String(summary.approved),
      unit: "Completed Deals",
      link: "",
      sparkColor: "#22c55e",
      sparkPoints,
    },
    {
      icon: "dollar-sign" as const,
      color: "violet",
      label: "Total Commission",
      value: formatCurrency(summary.totalCommission),
      unit: "Earned",
      link: "",
      sparkColor: "#a855f7",
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
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
