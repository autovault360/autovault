import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <Card className="flex min-h-[108px] flex-col rounded-lg border border-slate-800/60 bg-card p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-28" />
          <SkeletonBar className="h-3 w-36" />
        </div>
      </div>
    </Card>
  );
}

function PanelSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card className="flex h-full flex-col gap-4 rounded-lg border border-slate-800/60 bg-card p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <SkeletonBar className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-36" />
            <SkeletonBar className="h-3 w-48" />
          </div>
        </div>
        <SkeletonBar className="h-8 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBar className="h-2.5 w-20" />
            <SkeletonBar className="h-4 w-16" />
          </div>
        ))}
      </div>
      <SkeletonBar className="h-3 w-32" />
    </Card>
  );
}

export default function CpaDashboardSkeleton() {
  return (
    <div>
      <section className="mb-4 flex flex-col gap-4 border-b border-slate-800/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-3 w-56" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SkeletonBar className="h-10 w-56 rounded-lg" />
          <SkeletonBar className="h-10 w-44 rounded-lg" />
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.1fr_1.3fr]">
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={6} />
        <PanelSkeleton rows={5} />
      </div>
    </div>
  );
}
