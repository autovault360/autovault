import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export default function ProfitLossPageSkeleton() {
  return (
    <div className="profit-loss-page relative print:bg-white">
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="h-5 w-28 rounded-full" />
          </div>
          <SkeletonBar className="h-4 w-96" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-9 w-40" />
          <SkeletonBar className="h-9 w-40" />
          <SkeletonBar className="h-9 w-32" />
          <SkeletonBar className="h-9 w-32" />
          <SkeletonBar className="h-9 w-32" />
        </div>
      </section>

      <section className="mb-3.5 flex flex-wrap items-center gap-2">
        <SkeletonBar className="h-9 w-36" />
        <SkeletonBar className="h-9 w-36" />
        <SkeletonBar className="h-9 w-32" />
        <SkeletonBar className="h-9 w-32" />
        <SkeletonBar className="h-9 w-32" />
        <SkeletonBar className="h-9 w-36" />
        <SkeletonBar className="h-9 w-28" />
      </section>

      <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-800/50 bg-transparent p-3 text-slate-200 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <SkeletonBar className="h-3 w-24" />
                <SkeletonBar className="h-5 w-20" />
                <SkeletonBar className="h-4 w-16" />
              </div>
            </div>
            <SkeletonBar className="mt-1 h-3 w-32" />
          </Card>
        ))}
      </section>

      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-11 w-36 rounded-none" />
        ))}
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
          <SkeletonBar className="mb-3 h-8 w-full" />
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBar key={i} className="mb-2 h-8 w-full" />
          ))}
        </Card>
        <div className="space-y-3.5">
          <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <div className="mb-3 flex items-center justify-between gap-2">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-8 w-28" />
            </div>
              <SkeletonBar className="h-52 w-full" />
            </Card>
            <Card className="rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
              <SkeletonBar className="mb-3 h-4 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBar key={i} className="mb-2 h-10 w-full" />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
