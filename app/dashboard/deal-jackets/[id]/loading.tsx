
export default function DealJacketDetailLoading() {
  return (
    <div className="relative pb-8 animate-pulse">
      <div className="mb-3 inline-flex items-center gap-1.5">
        <div className="h-3.5 w-3.5 rounded bg-slate-800/80" />
        <div className="h-3 w-36 rounded bg-slate-800/80" />
      </div>
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-7 w-64 rounded bg-slate-800/80" />
          <div className="h-5 w-16 rounded-full bg-slate-800/60" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-2">
            <SkeletonBar className="h-9 w-36" />
            <SkeletonBar className="h-9 w-24" />
            <div className="inline-flex overflow-hidden rounded-md">
              <SkeletonBar className="h-9 w-20 rounded-r-none" />
              <SkeletonBar className="h-9 w-9 rounded-l-none border-l border-slate-700" />
            </div>
          </div>
        </div>
      </section>
      <div className="mb-4 rounded-lg border border-slate-800/90 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 min-w-0 flex-1">
            <SkeletonBar className="h-[90px] w-full sm:h-[88px] sm:w-[140px] rounded-lg shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <SkeletonBar className="h-5 w-48" />
                <SkeletonBar className="h-3 w-20" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1 min-w-0">
                    <SkeletonBar className="h-3 w-16 shrink-0" />
                    <SkeletonBar className="h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full shrink-0 lg:w-auto lg:max-w-none">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:grid-rows-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[76px] rounded-md border border-slate-800/80 bg-slate-800/40 p-2.5"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-1 px-4 py-3">
            <div className="h-3 w-20 rounded bg-slate-800/60" />
            {i > 0 && <div className="h-3 w-6 rounded bg-slate-800/40" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4 xl:items-start">
        <div className="flex flex-col gap-3.5">
          <div className="rounded-sm border border-slate-700 bg-slate-800/30 p-3">
            <SkeletonBar className="mb-2 h-4 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-slate-700 bg-slate-800/30 p-3">
            <SkeletonBar className="mb-2 h-4 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-sm border border-slate-700 bg-slate-800/30 p-3">
            <SkeletonBar className="mb-2 h-4 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-sm border border-slate-700 bg-slate-800/30 p-3">
            <SkeletonBar className="mb-2 h-4 w-24" />
            <SkeletonBar className="mb-2 h-3 w-36" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-sm border border-slate-700 bg-slate-800/30 p-3">
            <SkeletonBar className="mb-2 h-4 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/80 ${className ?? ""}`}
    />
  );
}
