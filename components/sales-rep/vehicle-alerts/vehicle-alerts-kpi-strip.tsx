"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import type { IVehicleAlertKpiSummary } from "@/lib/sales-rep/vehicle-alerts/types";
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
    return (
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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

      <Card className="flex h-full min-w-0 flex-col rounded-sm border border-slate-700/80 bg-card p-3 text-slate-200 shadow-none backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-purple-500/15 text-purple-400">
            <Info className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-[13px] text-slate-500">What Happens Next?</div>
            <p className="text-[12px] leading-relaxed text-slate-400">
              Admin will review the deal jacket, documents, and information.
            </p>
            <button
              type="button"
              onClick={onLearnMore}
              className="text-[12px] font-medium text-blue-400 transition hover:text-blue-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
