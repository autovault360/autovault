import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function StatCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-800/50 bg-transparent p-3 text-slate-200 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
      <SkeletonBar className="mt-1 h-9 w-full" />
      <SkeletonBar className="mt-auto -mx-3 -mb-3 h-10 rounded-b-sm" />
    </Card>
  );
}

function CardShellSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-3 w-32" />
        <SkeletonBar className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBar className="h-28 w-full" />
      <SkeletonBar className="h-8 w-24" />
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div>
      {/* AdminHeader */}
      <header className="mb-3.5 flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <SkeletonBar className="h-10 w-full max-w-[400px]" />
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-8 w-8 rounded-full" />
        </div>
      </header>

      {/* Welcome */}
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-64" />
          <SkeletonBar className="h-4 w-80" />
        </div>
        <SkeletonBar className="h-9 w-36" />
      </section>

      {/* KPI + Compare */}
      <section className="mb-3.5 grid gap-3.5 2xl:grid-cols-[1fr_380px]">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-3 w-40" />
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBar className="h-4 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBar key={i} className="h-6 w-full" />
          ))}
        </Card>
      </section>

      {/* Charts */}
      <section className="mb-3.5 grid gap-3.5 md:grid-cols-2 2xl:grid-cols-[1.1fr_1fr_1fr_1.3fr]">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardShellSkeleton key={i} />
        ))}
      </section>

      {/* Deals + Top vehicles */}
      <section className="mb-3.5 grid gap-3.5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-3 w-36" />
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBar className="h-6 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBar key={i} className="h-8 w-full" />
          ))}
          <SkeletonBar className="h-8 w-24" />
        </Card>
        <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-3 w-40" />
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <SkeletonBar className="h-9 w-14 shrink-0 rounded-md" />
              <div className="flex-1 space-y-1">
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-2.5 w-32" />
              </div>
              <SkeletonBar className="h-8 w-16" />
            </div>
          ))}
          <SkeletonBar className="h-8 w-24" />
        </Card>
      </section>

      {/* Bottom row */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none" key={i}>
            <div className="flex items-center justify-between">
              <SkeletonBar className="h-3 w-36" />
              <SkeletonBar className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <SkeletonBar className="h-2.5 w-20" />
                  <SkeletonBar className="h-4 w-16" />
                </div>
              ))}
            </div>
            <SkeletonBar className="h-8 w-24" />
          </Card>
        ))}
      </section>
    </div>
  );
}
