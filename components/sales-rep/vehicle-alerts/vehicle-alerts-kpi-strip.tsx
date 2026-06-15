"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import type { IVehicleAlertKpiSummary } from "@/lib/sales-rep/vehicle-alerts/types";

const CARD_COUNT = 4;

type Props = {
  summary: IVehicleAlertKpiSummary;
  loading?: boolean;
  onLearnMore: () => void;
};

export default function VehicleAlertsKpiStrip({
  summary,
  loading,
  onLearnMore,
}: Props) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const cards: (KPICardData & { valueClassName?: string })[] = [
    {
      icon: "circle-alert",
      color: "amber",
      label: "Pending Approval",
      value: String(summary.pendingCount),
      unit: "Vehicles · Requires Admin Approval",
      link: "View Details",
      sparkColor: "#f59e0b",
      sparkPoints: "0,40 100,20 200,8",
    },
    {
      icon: "dollar-sign",
      color: "blue",
      label: "Total Value",
      value: formatCommissionPrice(summary.totalValue),
      unit: "Combined Sale Price",
      link: "View Details",
      sparkColor: "#3b82f6",
      sparkPoints: "0,40 100,20 200,8",
    },
    {
      icon: "badge-check",
      color: "green",
      label: "Oldest Pending",
      value: `${summary.oldestPendingDays} Days`,
      unit: summary.oldestPendingDate,
      link: "View Details",
      sparkColor: "#22c55e",
      sparkPoints: "0,40 100,20 200,8",
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

      <Card className="flex h-full min-w-0 flex-col rounded-sm border border-slate-700/80 bg-card p-3 text-slate-200 shadow-none backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-500/10">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              How It Works
            </p>
            <p className="mt-1 text-[12px] leading-snug text-slate-400">
              Vehicles marked sold by sales reps require admin approval before
              commission is finalized.
            </p>
            <button
              type="button"
              onClick={onLearnMore}
              className="mt-2 text-[11px] font-medium text-blue-400 hover:text-blue-300"
            >
              Learn more
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
