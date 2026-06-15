"use client";

import { cn } from "@/lib/utils";
import SoldVehicleKpiStrip from "./sold-vehicle-kpi-strip";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function SoldVehiclesCenterSkeleton() {
  return (
    <div className="space-y-3.5">
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

      <div className="grid min-w-0 grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-sm border border-slate-800/60 bg-card p-3.5">
          <SkeletonBar className="h-8 w-full max-w-[320px]" />
          <div className="mt-3 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <SkeletonBar key={i} className="h-12" />
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-slate-800/60 bg-card p-3.5">
          <SkeletonBar className="h-8 w-full max-w-[280px]" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBar key={i} className="h-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
