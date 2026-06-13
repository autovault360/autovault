function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-slate-800/60 ${className ?? ""}`}
    />
  );
}

function SkeletonCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      {children}
    </div>
  );
}

function SkeletonDetailRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header skeleton */}
      <section className="mb-3.5 space-y-2.5 px-0.5">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Grid skeleton matching VehicleDetailShell layout */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5 auto-rows-auto">
        {/* Gallery - sm:col-span-2 xl:col-span-2 */}
        <div className="sm:col-span-2 xl:col-span-2">
          <SkeletonCardShell>
            <Skeleton className="h-[350px] w-full rounded-md" />
            <div className="mt-2 flex items-center gap-1">
              <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
              <div className="flex flex-1 gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-[3.75rem] shrink-0 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
            </div>
          </SkeletonCardShell>
        </div>

        {/* Summary Card - sm:col-span-2 xl:col-span-2 */}
        <div className="sm:col-span-2 xl:col-span-2">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-36" />
            <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
              <div className="divide-y divide-slate-800/60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonDetailRow key={`l-${i}`} />
                ))}
              </div>
              <div className="divide-y divide-slate-800/60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonDetailRow key={`r-${i}`} />
                ))}
              </div>
            </div>
          </SkeletonCardShell>
        </div>

        {/* Pricing & Actions - sm:col-span-2 xl:col-span-1 */}
        <div className="sm:col-span-2 xl:col-span-1">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-32" />
            <div className="flex-1 space-y-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonDetailRow key={`p-${i}`} />
              ))}
            </div>
            <div className="mt-auto space-y-2 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`b-${i}`} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </SkeletonCardShell>
        </div>

        {/* Features - sm:col-span-2 xl:col-span-2 */}
        <div className="sm:col-span-2 xl:col-span-2">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-28" />
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`f-${i}`} className="flex items-center gap-2 py-1.5">
                  <Skeleton className="h-3.5 w-3.5 shrink-0" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-12 shrink-0" />
                </div>
              ))}
            </div>
          </SkeletonCardShell>
        </div>

        {/* Reconditioning - sm:col-span-1 xl:col-span-1 */}
        <div className="sm:col-span-1 xl:col-span-1">
          <SkeletonCardShell>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonDetailRow key={`e-${i}`} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </SkeletonCardShell>
        </div>

        {/* Status History - sm:col-span-1 xl:col-span-1 */}
        <div className="sm:col-span-1 xl:col-span-1">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-28" />
            <div className="space-y-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonDetailRow key={`s-${i}`} />
              ))}
            </div>
          </SkeletonCardShell>
        </div>

        {/* Activity Log - sm:col-span-2 xl:col-span-1 xl:row-span-2 */}
        <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-24" />
            <div className="space-y-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`a-${i}`} className="flex items-center gap-3 rounded-sm px-1 py-1.5">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2 w-20" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCardShell>
        </div>

        {/* Comparables - sm:col-span-2 xl:col-span-3 */}
        <div className="sm:col-span-2 xl:col-span-3">
          <SkeletonCardShell>
            <Skeleton className="mb-2.5 h-3 w-36" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <th key={i} className="px-1 py-1.5 text-left">
                        <Skeleton className="h-3 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-1 py-2">
                          <Skeleton className="h-3 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Skeleton className="mt-auto -mx-3.5 -mb-3.5 h-10 rounded-b-sm" />
          </SkeletonCardShell>
        </div>

        {/* Notes - sm:col-span-2 xl:col-span-1 */}
        <div className="sm:col-span-2 xl:col-span-1">
          <SkeletonCardShell>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-12 rounded-md" />
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
          </SkeletonCardShell>
        </div>
      </div>
    </div>
  );
}
