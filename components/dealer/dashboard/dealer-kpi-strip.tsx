"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { cn } from "@/lib/utils";
import type { DealerKpi } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

export default function DealerKpiStrip({
  kpis,
  loading,
}: {
  kpis: DealerKpi[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm border border-[#1e293b] bg-[#0a101d]/60 p-3"
          >
            <div className="flex items-start gap-2.5">
              <SkeletonBar className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-2.5 w-20" />
                <SkeletonBar className="h-5 w-16" />
                <SkeletonBar className="h-2 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.label}
          data={kpi}
          showSparkline={false}
          showLink={false}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </div>
  );
}
