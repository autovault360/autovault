import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function ProfitLossPageSkeleton() {
  return (
    <div className="min-w-0 space-y-3.5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonBar className="h-8 w-40" />
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <SkeletonBar className="h-9 w-32" />
          <SkeletonBar className="h-9 w-52" />
          <SkeletonBar className="h-9 w-28" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={index}
            className="h-28 rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none"
          >
            <SkeletonBar className="h-full w-full" />
          </Card>
        ))}
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
