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
    <Card className="flex h-full flex-col rounded-sm border border-[#1e293b] bg-card p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-1">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-28" />
        </div>
      </div>
    </Card>
  );
}

function ExpandableShellSkeleton() {
  return (
    <div className="mb-3.5 rounded-sm border border-[#1e293b] bg-card shadow-none">
      <div className="flex items-center justify-between gap-2 border-b border-[#1e293b]/80 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <SkeletonBar className="h-6 w-6 rounded-full" />
          <div>
            <SkeletonBar className="h-3 w-44" />
            <SkeletonBar className="mt-1 h-2.5 w-64" />
          </div>
        </div>
        <SkeletonBar className="h-3 w-20" />
      </div>
    </div>
  );
}

function ExpandableShellSkeletonSimple() {
  return (
    <div className="mb-3.5 rounded-sm border border-[#1e293b] bg-card shadow-none">
      <div className="flex items-center justify-between gap-2 border-b border-[#1e293b]/80 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <SkeletonBar className="h-6 w-6 rounded-full" />
          <div>
            <SkeletonBar className="h-3 w-44" />
          </div>
        </div>
        <SkeletonBar className="h-3 w-20" />
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
      <SkeletonBar className="mb-3 h-3 w-36" />
      <SkeletonBar className="h-32 w-full" />
      <SkeletonBar className="mt-3 h-8 w-24" />
    </div>
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
      {/* Page Header - matches PageHeaderTitle */}
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <SkeletonBar className="h-6 w-72" />
          <SkeletonBar className="mt-1 h-3 w-40" />
        </div>
      </section>

      {/* KPI Section - 7 cards */}
      <section className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </section>

      {/* Sticky Notes - expandable shell (section 1) */}
      <ExpandableShellSkeleton />

      {/* Calendar - expandable shell (section 2) with month strip */}
      <ExpandableShellSkeleton />
      <section className="-mt-3 mb-3.5 px-0.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="flex gap-0 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1 py-1">
                <SkeletonBar className="h-2 w-4" />
                <SkeletonBar className="h-7 w-7 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Analytics Row - 3 panels */}
      <section className="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Inventory Panel */}
        <PanelSkeleton />
        {/* P&L Summary Panel */}
        <PanelSkeleton />
        {/* Recent Activity Panel */}
        <PanelSkeleton />
      </section>

      {/* Performance Row - CardShell with 3 columns */}
      <section className="mb-3.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

      {/* Sales Rep Section - expandable shell (section 3) */}
      <ExpandableShellSkeletonSimple />
      <section className="-mt-3 mb-3.5 px-0.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          {/* Sales Rep KPI cards - 5 in a row */}
          <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
          {/* Table + Charts grid */}
          <div className="grid gap-3.5 xl:grid-cols-[1fr_320px]">
            <div className="overflow-x-auto rounded-sm border border-slate-800/60">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <th key={i} className="px-2.5 py-2.5">
                        <SkeletonBar className="h-3 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-2.5 py-2.5">
                          <div className="flex items-center gap-2">
                            {j === 1 && <SkeletonBar className="h-7 w-7 rounded-full" />}
                            <SkeletonBar className={j === 0 ? "h-7 w-7 rounded-full" : "h-3 w-20"} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Charts */}
            <div className="space-y-3">
              <div className="rounded-sm border border-slate-800/60 p-3">
                <SkeletonBar className="mb-2 h-3 w-24" />
                <SkeletonBar className="h-36 w-full" />
              </div>
              <div className="rounded-sm border border-slate-800/60 p-3">
                <SkeletonBar className="mb-2 h-3 w-24" />
                <SkeletonBar className="h-36 w-full" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Gross Profit Section - expandable shell (section 5) */}
      <ExpandableShellSkeletonSimple />
      <section className="-mt-3 mb-3.5 px-0.5">
        <Card className="rounded-sm border border-[#1e293b] bg-card p-3.5 shadow-none">
          {/* Search + Filters */}
          <div className="mb-3 flex items-center gap-2">
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="h-8 w-32" />
            <SkeletonBar className="h-8 w-32" />
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded-sm border border-slate-800/60">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={i} className="px-2.5 py-2.5">
                      <SkeletonBar className="h-3 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-2.5 py-2.5">
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
