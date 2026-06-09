"use client";

import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import SoldVehicleKpiStrip from "./sold-vehicle-kpi-strip";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function SoldVehiclesCenterSkeleton() {
  return (
    <CardShell className="min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SkeletonBar className="h-5 w-48" />
          <div className="flex gap-2">
            <SkeletonBar className="h-8 w-[130px]" />
            <SkeletonBar className="h-8 w-36" />
          </div>
        </div>

        <SoldVehicleKpiStrip
          kpis={{
            totalSold: { icon: "shopping-cart", color: "blue", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
            totalSales: { icon: "dollar-sign", color: "green", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
            totalGrossProfit: { icon: "pie-chart", color: "violet", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
            averageGrossProfit: { icon: "triangle-alert", color: "amber", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
            soldThisMonth: { icon: "refresh-cw", color: "teal", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
            pendingPayments: { icon: "shield", color: "orange", label: "", value: "", link: "#", sparkColor: "", sparkPoints: "" },
          }}
          loading
        />

        <div className="flex flex-wrap gap-2">
          <SkeletonBar className="h-8 min-w-[200px] flex-1" />
          <SkeletonBar className="h-8 w-[130px]" />
          <SkeletonBar className="h-8 w-[140px]" />
          <SkeletonBar className="h-8 w-44" />
          <SkeletonBar className="h-8 w-20" />
        </div>

        <div className="overflow-hidden rounded-sm border border-slate-700/80 bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 border-b border-slate-800/50 px-3 py-3 last:border-0"
            >
              {Array.from({ length: 6 }).map((__, j) => (
                <SkeletonBar key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
