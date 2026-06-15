import { Card } from "@/components/ui/card";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";

const CARD_COUNT = 5;

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export function VehicleStatsSkeleton() {
  return <KpiGridSkeleton count={CARD_COUNT} className="mb-3.5" />;
}

export function VehiclesTableSkeleton() {
  return (
    <div className="p-3.5 text-slate-200 shadow-none">
      <div className="mb-3.5 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <SkeletonBar className="h-9 w-full max-w-sm" />
        <div className="flex flex-wrap items-center gap-2 justify-between w-full">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBar className="h-9 w-[130px]" />
            <SkeletonBar className="h-9 w-[130px]" />
            <SkeletonBar className="h-9 w-[130px]" />
            <SkeletonBar className="h-9 w-[130px]" />
            <SkeletonBar className="h-9 w-28" />
            <SkeletonBar className="h-9 w-28" />
          </div>
          <SkeletonBar className="h-9 w-24" />
        </div>
      </div>
      <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent shadow-none">
        <div className="space-y-0 p-3.5">
          <SkeletonBar className="mb-3 h-10 w-full" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="mb-2 flex items-center gap-3 rounded-sm">
              <SkeletonBar className="h-12 w-16 shrink-0 rounded-md" />
              <SkeletonBar className="h-12 flex-1 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-800/80 px-3.5 py-3">
          <SkeletonBar className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-8 w-[72px]" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VehiclesPageSkeleton() {
  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-44" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <SkeletonBar className="h-9 w-36" />
      </section>
      <VehicleStatsSkeleton />
      <VehiclesTableSkeleton />
    </div>
  );
}
