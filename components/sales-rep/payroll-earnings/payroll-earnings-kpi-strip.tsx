"use client";

import { formatCommissionCurrency } from "@/lib/sales-rep/commissions/format";
import type { IPayrollEarningsKpiSummary } from "@/lib/sales-rep/payroll-earnings/types";
import { kpiGridClass } from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import PayrollKpiCard from "./payroll-kpi-card";

const CARD_COUNT = 5;

type Props = {
  summary: IPayrollEarningsKpiSummary;
  loading?: boolean;
};

export default function PayrollEarningsKpiStrip({ summary, loading }: Props) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards = [
    {
      icon: "dollar-sign" as const,
      color: "green",
      label: "Total Earnings",
      value: formatCommissionCurrency(summary.totalEarnings),
      unit: "This Month",
      trend: summary.totalEarningsTrend,
      trendColor: "green" as const,
    },
    {
      icon: "percent" as const,
      color: "violet",
      label: "Total Commissions",
      value: formatCommissionCurrency(summary.totalCommissions),
      unit: "This Month",
      trend: summary.totalCommissionsTrend,
      trendColor: "green" as const,
      valueClassName: "text-white",
    },
    {
      icon: "car" as const,
      color: "blue",
      label: "Vehicles Sold",
      value: String(summary.vehiclesSold),
      unit: "This Month",
      trend: summary.vehiclesSoldTrend,
      trendColor: "green" as const,
    },
    {
      icon: "wallet" as const,
      color: "orange",
      label: "Avg Commission Per Vehicle",
      value: formatCommissionCurrency(summary.avgCommissionPerVehicle),
      unit: "This Month",
      trend: summary.avgCommissionTrend,
      trendColor: "green" as const,
    },
    {
      icon: "badge-check" as const,
      color: "teal",
      label: "Next Pay Date",
      value: summary.nextPayDate,
      unit: "Estimated",
      trend:
        summary.daysUntilPay > 0
          ? `${summary.daysUntilPay} days remaining`
          : "Pay date passed",
      trendColor: "blue" as const,
      valueClassName: "text-[20px]",
    },
  ];

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {cards.map((card) => (
        <PayrollKpiCard key={card.label} data={card} />
      ))}
    </div>
  );
}
