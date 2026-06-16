import { Card } from "@/components/ui/card";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";

const CARD_COUNT = 5;

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function ProfitLossPageSkeleton() {
  return (
    <div className="min-w-0 space-y-3.5">
      <section className="mb-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-2">
              <SkeletonBar className="h-7 w-44" />
              <SkeletonBar className="h-4 w-80 max-w-full" />
            </div>
            <KpiGridSkeleton count={CARD_COUNT} />
          </div>
          <div className="flex w-full flex-col gap-2.5 lg:w-[300px] lg:shrink-0">
            <SkeletonBar className="h-9 w-full" />
            <SkeletonBar className="h-9 w-full" />
            <SkeletonBar className="h-9 w-full" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
          <SkeletonBar className="mb-3 h-4 w-44" />
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonBar key={index} className="mb-2 h-8 w-full rounded-sm" />
          ))}
        </Card>
        <div className="space-y-3.5">
          <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-3 h-4 w-40" />
            <SkeletonBar className="h-[260px] w-full rounded-sm" />
          </Card>
          <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-3 h-4 w-36" />
            <SkeletonBar className="h-44 w-full rounded-sm" />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none"
          >
            <SkeletonBar className="mb-3 h-4 w-36" />
            {Array.from({ length: 3 }).map((__, row) => (
              <SkeletonBar key={row} className="mb-4 h-10 w-full rounded-sm" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
