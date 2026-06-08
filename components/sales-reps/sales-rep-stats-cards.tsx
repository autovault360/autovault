import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import {
  formatCurrency,
  type SalesRepStats,
} from "@/lib/sales-reps/types";

function buildCards(stats: SalesRepStats) {
  return [
    {
      icon: "dollar-sign" as const,
      color: "green",
      label: "Commissions Paid Out (MTD)",
      value: formatCurrency(stats.commissionsPaidMtd),
      delta: stats.commissionsPaidMtdDelta,
      link: "View Commissions",
      sparkColor: "#10b981",
      sparkPoints: stats.commissionsPaidMtdSparkPoints,
      deltaColor: stats.commissionsPaidMtdDeltaColor,
    },
    {
      icon: "bar-chart-3" as const,
      color: "violet",
      label: "Total Commissions YTD",
      value: formatCurrency(stats.totalCommissionsYtd),
      delta: stats.totalCommissionsYtdDelta,
      link: "View YTD Report",
      sparkColor: "#a855f7",
      sparkPoints: stats.totalCommissionsYtdSparkPoints,
      deltaColor: stats.totalCommissionsYtdDeltaColor,
    },
  ];
}

export default function SalesRepStatsCards({ stats }: { stats: SalesRepStats }) {
  const cards = buildCards(stats);

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] shadow-none">
        <div className="flex items-start gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-slate-500">Total Sales Reps</div>
            <div className="mt-0.5 text-[18px] font-bold text-white">
              {stats.totalReps}
            </div>
            <div className="text-[13px] font-medium text-emerald-400">
              {stats.activeReps} Active
            </div>
          </div>
        </div>
      </Card>

      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline
          showLink={false}
          deltaColor={card.deltaColor}
          className="shadow-[0_0_0_1px_rgba(148,163,184,0.08)]"
        />
      ))}
    </section>
  );
}
