"use client";

import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { ISalesRepMetrics } from "@/lib/sales-rep/dashboard/types";

const CARD_COUNT = 4;

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

type Props = {
  metrics: ISalesRepMetrics;
};

export default function PersonalMetricsStrip({ metrics }: Props) {
  const cards: KPICardData[] = [
    {
      icon: "car",
      color: "blue",
      label: "My Cars Sold",
      value: String(metrics.currentMonthUnits),
      unit: "This Month",
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints,
    },
    {
      icon: "dollar-sign",
      color: "green",
      label: "Gross Profit",
      value: formatCurrency(metrics.currentMonthGross),
      unit: "This Month",
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints,
    },
    {
      icon: "percent",
      color: "violet",
      label: "My Commission",
      value: formatCurrency(metrics.currentMonthCommission),
      unit: "This Month",
      link: "View Details",
      sparkColor: "#a855f7",
      sparkPoints,
    },
    {
      icon: "tag",
      color: "amber",
      label: "Pending Commission",
      value: formatCurrency(metrics.awaitingApprovalCommission),
      unit: "Awaiting Approval",
      link: "View Details",
      sparkColor: "#f59e0b",
      sparkPoints,
    },
  ];

  return (
    <section className={kpiGridClass(CARD_COUNT)}>
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          {...KPI_CARD_DEFAULT_PROPS}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
