import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function KpiSkeleton() {
  return (
    <Card className="flex h-full flex-col rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}

export default function PayrollDashboardSkeleton() {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <SkeletonBar className="h-8 w-48" />
          <SkeletonBar className="mt-2 h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <SkeletonBar className="h-9 w-52" />
          <SkeletonBar className="h-9 w-28" />
          <SkeletonBar className="h-9 w-28" />
          <SkeletonBar className="h-9 w-24" />
        </div>
      </div>

      <section className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>

      <div className="grid gap-3.5 xl:grid-cols-[1fr_320px]">
        <div>
          <Card className="mb-3.5 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-3 h-4 w-32" />
            <SkeletonBar className="mb-3 h-9 w-full max-w-md" />
            <div className="space-y-2">
              <SkeletonBar className="h-10 w-full" />
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonBar key={i} className="h-12 w-full" />
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              <SkeletonBar className="h-4 w-40" />
              <SkeletonBar className="h-8 w-48" />
            </div>
          </Card>
          <Card className="mb-3.5 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-3 h-4 w-32" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBar key={i} className="h-24 w-full" />
              ))}
            </div>
          </Card>
          <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="mb-3 h-4 w-36" />
            <SkeletonBar className="h-32 w-full rounded-lg" />
          </Card>
        </div>
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="mb-3.5 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none"
            >
              <SkeletonBar className="mb-3 h-4 w-40" />
              <SkeletonBar className="h-28 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
