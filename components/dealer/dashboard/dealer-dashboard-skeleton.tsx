function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-sm border border-[#1e293b] bg-[#0a101d]/60 p-3.5 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default function DealerDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 antialiased">
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
        <div className="flex-1">
          <SkeletonBar className="mb-2 h-7 w-80" />
          <SkeletonBar className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-8 w-36" />
          <SkeletonBar className="h-8 w-8 rounded-full" />
          <SkeletonBar className="h-9 w-9 rounded-full" />
        </div>
      </section>

      <div className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start gap-2.5">
              <SkeletonBar className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-2.5 w-20" />
                <SkeletonBar className="h-5 w-16" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <SkeletonBar className="mb-3 h-3 w-32" />
            <SkeletonBar className="h-36 w-full" />
          </SkeletonCard>
        ))}
      </div>

      <SkeletonCard className="mb-3.5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <SkeletonBar className="h-16" />
          <SkeletonBar className="h-16" />
          <SkeletonBar className="h-16" />
          <SkeletonBar className="h-16" />
        </div>
      </SkeletonCard>

      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} className="mb-3.5">
          <SkeletonBar className="mb-3 h-3 w-40" />
          <SkeletonBar className="h-48 w-full" />
        </SkeletonCard>
      ))}
    </div>
  );
}
