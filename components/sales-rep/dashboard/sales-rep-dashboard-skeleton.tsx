function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-700/60 ${className ?? ""}`}
    />
  );
}

function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={`rounded-sm border border-slate-800 bg-slate-900/40 p-3.5 shadow-none ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default function SalesRepDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 antialiased">
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
        <div className="flex-1">
          <SkeletonBar className="mb-2 h-7 w-72" />
          <SkeletonBar className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-8 w-24 rounded-md" />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-3.5 items-start">
        <div className="flex flex-col gap-3.5 min-w-0">
          <SkeletonCard>
            <SkeletonBar className="mb-3 h-3 w-32" />
            <div className="flex gap-3">
              <SkeletonBar className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-1 gap-3">
                <SkeletonBar className="h-14 flex-1" />
                <SkeletonBar className="h-14 flex-1" />
                <SkeletonBar className="h-14 flex-1" />
              </div>
            </div>
          </SkeletonCard>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="p-3">
                <div className="flex items-center gap-2.5">
                  <SkeletonBar className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBar className="h-2.5 w-20" />
                    <SkeletonBar className="h-5 w-16" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <SkeletonCard>
              <SkeletonBar className="mb-3 h-3 w-36" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="mb-2 flex items-center gap-2">
                  <SkeletonBar className="h-8 w-8 rounded" />
                  <SkeletonBar className="h-8 flex-1" />
                  <SkeletonBar className="h-8 w-16" />
                </div>
              ))}
            </SkeletonCard>

            <div className="flex flex-col gap-3.5">
              <SkeletonCard>
                <SkeletonBar className="mb-3 h-3 w-28" />
                <div className="flex gap-2">
                  <SkeletonBar className="h-20 flex-1" />
                  <SkeletonBar className="h-20 flex-1" />
                </div>
              </SkeletonCard>
              <SkeletonCard>
                <SkeletonBar className="mb-3 h-3 w-32" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="mb-2 flex items-center gap-2">
                    <SkeletonBar className="h-7 flex-1" />
                    <SkeletonBar className="h-7 w-20" />
                    <SkeletonBar className="h-7 w-16" />
                  </div>
                ))}
              </SkeletonCard>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 w-full xl:w-[360px] 2xl:w-[400px] shrink-0">
          <SkeletonCard>
            <SkeletonBar className="mb-3 h-3 w-28" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="mb-2 flex items-center gap-2">
                <SkeletonBar className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <SkeletonBar className="h-3 w-32" />
                  <SkeletonBar className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard>
            <SkeletonBar className="mb-3 h-3 w-28" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="mb-2 flex items-center gap-2">
                <SkeletonBar className="h-2.5 w-16" />
                <SkeletonBar className="h-2.5 flex-1" />
                <SkeletonBar className="h-5 w-5 rounded" />
              </div>
            ))}
          </SkeletonCard>
        </div>
      </section>

      <div className="mt-3.5">
        <SkeletonCard>
          <div className="mb-3 flex items-center justify-between">
            <SkeletonBar className="h-3 w-32" />
            <div className="flex gap-2">
              <SkeletonBar className="h-7 w-20" />
              <SkeletonBar className="h-7 w-28" />
            </div>
          </div>
          <SkeletonBar className="mb-3 h-3 w-20" />
          <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBar key={i} className="h-[88px]" />
            ))}
          </div>
          <div className="mb-3 flex gap-2">
            <SkeletonBar className="h-8 flex-1 max-w-[280px]" />
            <SkeletonBar className="h-8 w-28" />
            <SkeletonBar className="h-8 w-32" />
            <SkeletonBar className="h-8 flex-1" />
          </div>
          <SkeletonBar className="h-64 w-full" />
        </SkeletonCard>
      </div>

      <div className="mt-3.5">
        <SkeletonCard>
          <SkeletonBar className="mb-3 h-3 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SkeletonBar className="h-24 col-span-2" />
            <SkeletonBar className="h-24" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
