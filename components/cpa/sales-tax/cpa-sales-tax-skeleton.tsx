import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function CpaSalesTaxSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-64" />
          <SkeletonBar className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <KpiGridSkeleton count={5} />

      <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
        <SkeletonBar className="mb-3 h-4 w-56" />
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonBar key={index} className="mb-2 h-8 w-full rounded-sm" />
        ))}
      </Card>
    </div>
  );
}
