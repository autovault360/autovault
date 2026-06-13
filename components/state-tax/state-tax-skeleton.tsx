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
    <Card className="flex h-full flex-col gap-2 rounded-sm border border-slate-700 bg-card p-5 shadow-none">
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

export default function StateTaxPageSkeleton() {
  return (
    <div className="relative">
      {/* Header */}
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
        <div>
          <SkeletonBar className="h-6 w-52" />
          <SkeletonBar className="mt-1 h-3 w-72" />
        </div>
        <SkeletonBar className="h-9 w-36" />
      </section>

      {/* Tabs */}
      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-11 w-28 rounded-none" />
        ))}
      </div>

      {/* Config Form */}
      <Card className="mb-3.5 rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-9 w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* KPI Cards */}
      <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </section>

      {/* Bottom grid: YTD Summary + Transactions */}
      <section className="grid gap-3.5 xl:grid-cols-2">
        {/* YTD Summary */}
        <Card className="flex h-full flex-col rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
          <div className="mb-3 flex items-center justify-between gap-2">
            <SkeletonBar className="h-4 w-48" />
            <SkeletonBar className="h-3 w-24" />
          </div>
          <div className="mb-4 space-y-0 border-b border-slate-800/60 pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2.5">
                <SkeletonBar className="h-3 w-32" />
                <SkeletonBar className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <SkeletonBar className="h-28 w-28 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBar className="h-2 w-2 rounded-full" />
                  <SkeletonBar className="h-3 flex-1" />
                  <SkeletonBar className="h-3 w-16" />
                  <SkeletonBar className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="flex h-full flex-col rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
          <div className="mb-3 flex items-center justify-between gap-2">
            <SkeletonBar className="h-4 w-48" />
            <SkeletonBar className="h-3 w-16" />
          </div>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="pb-2.5">
                      <SkeletonBar className="h-3 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-2.5">
                        <SkeletonBar className="h-3 w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
