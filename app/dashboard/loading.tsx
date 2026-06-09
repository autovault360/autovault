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
    <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-[#1e293b] bg-card p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-28" />
        </div>
      </div>
    </Card>
  );
}

function PanelSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-2 rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
      <SkeletonBar className="h-3 w-36" />
      <SkeletonBar className="h-32 w-full" />
      <SkeletonBar className="h-8 w-24" />
    </Card>
  );
}

function KpiRowSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div>
      <header className="mb-3.5 flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <SkeletonBar className="h-10 w-full max-w-[400px]" />
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <section className="mb-3.5 px-0.5">
        <SkeletonBar className="h-6 w-72" />
        <SkeletonBar className="mt-2 h-4 w-40" />
      </section>

      <section className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>

      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-4 w-32" />
          </div>
          <div className="flex gap-0 overflow-x-auto">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1 py-1">
                <SkeletonBar className="h-2 w-4" />
                <SkeletonBar className="h-7 w-7 rounded-full" />
              </div>
            ))}
          </div>
          <SkeletonBar className="mt-3 h-4 w-full" />
        </Card>
      </section>

      <section className="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PanelSkeleton key={i} />
        ))}
      </section>

      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <SkeletonBar className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <SkeletonBar className="h-3 w-36" />
                  <SkeletonBar className="h-5 w-48" />
                  <SkeletonBar className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-[80px] flex-col gap-1.5 rounded-md bg-slate-800/40 p-2.5"
              >
                <SkeletonBar className="h-3 w-3/4" />
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="mt-auto h-3 w-1/2" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-3.5">
        <KpiRowSkeleton count={5} />
      </section>

      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-6 w-6 rounded-full" />
              <SkeletonBar className="h-4 w-48" />
            </div>
            <SkeletonBar className="h-4 w-20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mt-3 flex items-center gap-3">
              <SkeletonBar className="h-6 w-6 shrink-0 rounded-full" />
              <SkeletonBar className="h-4 flex-1" />
              <SkeletonBar className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </section>

      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-6 w-6 rounded-full" />
              <SkeletonBar className="h-4 w-36" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-8 w-48" />
              <SkeletonBar className="h-8 w-24" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mt-3 flex items-center gap-3">
              <SkeletonBar className="h-10 w-10 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-1">
                <SkeletonBar className="h-3 w-48" />
                <SkeletonBar className="h-3 w-32" />
              </div>
              <SkeletonBar className="h-4 w-24" />
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
