import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function CpaExpensesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-64" />
          <SkeletonBar className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <KpiGridSkeleton count={5} />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="min-h-[320px] rounded-lg border border-slate-800/50 bg-transparent p-4 shadow-none"
          >
            <SkeletonBar className="mb-4 h-4 w-40" />
            <SkeletonBar className="h-[220px] w-full rounded-sm" />
          </Card>
        ))}
      </div>

      <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
        <SkeletonBar className="mb-3 h-4 w-48" />
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBar key={index} className="mb-2 h-8 w-full rounded-sm" />
        ))}
      </Card>
    </div>
  );
}
