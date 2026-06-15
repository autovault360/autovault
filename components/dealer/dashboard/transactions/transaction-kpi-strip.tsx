"use client";

import { KPICard } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import type { TransactionKpiStrip } from "@/lib/dealer/dashboard/types";

const CARD_COUNT = 7;

export default function TransactionKpiStrip({
  kpis,
  loading,
}: {
  kpis: TransactionKpiStrip;
  loading?: boolean;
}) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards = [
    { data: kpis.totalTransactions, layout: "default" as const },
    { data: kpis.dealerSales, layout: "default" as const },
    { data: kpis.auctionSales, layout: "default" as const },
    { data: kpis.totalRevenue, layout: "default" as const },
    { data: kpis.pendingPayments, layout: "period" as const },
    { data: kpis.completedPayments, layout: "period" as const },
    { data: kpis.grossProfit, layout: "default" as const },
  ];

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {cards.map(({ data, layout }) => (
        <KPICard
          key={data.label}
          data={data}
          layout={layout}
          showSparkline={false}
          showLink={false}
          className={KPI_CARD_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
