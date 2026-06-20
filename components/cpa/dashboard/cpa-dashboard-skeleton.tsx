function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <div className="flex min-h-[108px] flex-col rounded-lg border border-slate-800/60 bg-card p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-28" />
          <SkeletonBar className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
}

function PanelHeaderSkeleton() {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-2">
          <SkeletonBar className="h-4 w-36" />
          <SkeletonBar className="h-3 w-48" />
        </div>
      </div>
      <SkeletonBar className="h-7 w-24 shrink-0 rounded-md" />
    </div>
  );
}

function StatCellSkeleton() {
  return (
    <div className="border-r border-b border-slate-700 p-4">
      <div className="flex flex-col items-center gap-4">
        <SkeletonBar className="h-2.5 w-20" />
        <SkeletonBar className="h-6 w-16" />
      </div>
    </div>
  );
}

function VehiclesByProfitPanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4 shadow-none">
      <PanelHeaderSkeleton />
      <div className="grid grid-cols-2 border-t border-l border-slate-700 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCellSkeleton key={i} />
        ))}
      </div>
      <SkeletonBar className="mt-4 h-3 w-32" />
    </div>
  );
}

function VehiclesByLossPanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4 shadow-none">
      <PanelHeaderSkeleton />
      <div className="grid grid-cols-2 border-t border-l border-slate-700 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCellSkeleton key={i} />
        ))}
      </div>
      <SkeletonBar className="mt-4 h-3 w-32" />
    </div>
  );
}

function SalesTaxPanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4 shadow-none">
      <PanelHeaderSkeleton />
      <div className="grid grid-cols-2 border-t border-l border-slate-700 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCellSkeleton key={i} />
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-slate-800/80 bg-[#0e1626]/60 p-3">
        <SkeletonBar className="h-2.5 w-24" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1.5">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-28" />
          </div>
          <SkeletonBar className="h-5 w-36 rounded-full" />
        </div>
      </div>
      <SkeletonBar className="mt-4 h-3 w-32" />
    </div>
  );
}

function PayrollCommissionPanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4 shadow-none">
      <PanelHeaderSkeleton />
      <div className="grid grid-cols-2 border-t border-l border-slate-700 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCellSkeleton key={i} />
        ))}
      </div>
      <div className="border-x border-b border-slate-700 py-3 text-center">
        <SkeletonBar className="mx-auto h-2.5 w-28" />
        <SkeletonBar className="mx-auto mt-2 h-8 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-6 border-x border-b border-slate-700 p-3 sm:grid-cols-2">
        <div className="space-y-2">
          <SkeletonBar className="h-2.5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <SkeletonBar className="h-2.5 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <SkeletonBar className="mt-4 h-3 w-32" />
    </div>
  );
}

function ExpensesPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={`flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4 shadow-none ${className ?? ""}`}>
      <PanelHeaderSkeleton />
      <div className="grid grid-cols-2 border-t border-l border-slate-700 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCellSkeleton key={i} />
        ))}
      </div>
      <div className="mt-5">
        <SkeletonBar className="mb-2 h-2.5 w-32" />
        <div className="space-y-2 rounded-md border border-slate-700/80 bg-[#0e1626]/40 p-2">
          <div className="flex items-center gap-4 border-b border-slate-800/50 px-2 pb-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="ml-auto h-3 w-16" />
            <SkeletonBar className="h-3 w-20" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-2">
              <SkeletonBar className="h-3 w-28" />
              <SkeletonBar className="ml-auto h-3 w-16" />
              <SkeletonBar className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <SkeletonBar className="mt-4 h-3 w-32" />
    </div>
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
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-9 w-[200px] rounded-lg" />
            <SkeletonBar className="h-9 w-[130px] rounded-lg" />
            <SkeletonBar className="h-9 w-[90px] rounded-lg" />
          </div>
          <SkeletonBar className="h-12 w-44 rounded-lg" />
        </div>
      </section>

      <div className="mb-4 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <VehiclesByProfitPanelSkeleton />
        <VehiclesByLossPanelSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <SalesTaxPanelSkeleton />
        <PayrollCommissionPanelSkeleton />
        <ExpensesPanelSkeleton className="col-span-2 2xl:col-span-1" />
      </div>
    </div>
  );
}
