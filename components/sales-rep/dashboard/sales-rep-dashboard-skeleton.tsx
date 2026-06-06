import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export default function SalesRepDashboardSkeleton() {
  return (
    <div>
      <div className="mb-3.5 border-b border-slate-800 pb-3.5">
        <SkeletonBar className="mb-2 h-8 w-72" />
        <SkeletonBar className="h-4 w-56" />
      </div>

      <div className="mb-3.5 grid gap-3.5 2xl:grid-cols-[1fr_300px]">
        <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
          <SkeletonBar className="mb-4 h-3 w-32" />
          <div className="flex gap-4">
            <SkeletonBar className="h-14 w-14 rounded-full" />
            <div className="flex flex-1 gap-4">
              <SkeletonBar className="h-16 flex-1" />
              <SkeletonBar className="h-16 flex-1" />
              <SkeletonBar className="h-16 flex-1" />
            </div>
          </div>
        </Card>
        <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
          <SkeletonBar className="mb-3 h-3 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBar key={i} className="mb-2 h-7 w-full" />
          ))}
        </Card>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-sm border border-slate-700 bg-transparent p-3 shadow-none"
          >
            <div className="flex gap-2.5">
              <SkeletonBar className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBar className="h-3 w-24" />
                <SkeletonBar className="h-5 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none"
          >
            <SkeletonBar className="mb-3 h-3 w-36" />
            {Array.from({ length: 4 }).map((_, j) => (
              <SkeletonBar key={j} className="mb-2 h-8 w-full" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
