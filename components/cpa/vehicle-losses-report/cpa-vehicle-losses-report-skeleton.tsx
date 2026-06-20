import { Card } from "@/components/ui/card";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function CpaVehicleLossesReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <SkeletonBar className="h-7 w-64" />
        <SkeletonBar className="h-4 w-[420px] max-w-full" />
      </div>

      <KpiGridSkeleton count={5} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none"
          >
            <SkeletonBar className="mb-3 h-4 w-40" />
            <SkeletonBar className="h-[220px] w-full rounded-sm" />
          </Card>
        ))}
      </div>

      <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
        <SkeletonBar className="mb-3 h-4 w-56" />
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBar key={index} className="mb-2 h-8 w-full rounded-sm" />
        ))}
      </Card>
    </div>
  );
}
