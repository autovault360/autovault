"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { formatCurrency } from "@/lib/deal-jackets/types";
import type { SalesRepDealJacketKpiSummary } from "@/lib/sales-rep/deal-jacket/types";

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
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse rounded-sm border border-slate-700 bg-slate-800/40"
          />
        ))}
      </div>
    );
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
