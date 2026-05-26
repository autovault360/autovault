import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export function SalesRepStatsSkeleton() {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card
          key={i}
          className="rounded-sm border border-slate-700 bg-transparent p-3 shadow-none"
        >
          <div className="flex items-start gap-2.5">
            <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-3 w-28" />
              <SkeletonBar className="h-6 w-20" />
              <SkeletonBar className="h-3 w-24" />
            </div>
          </div>
          {i > 0 && <SkeletonBar className="mt-3 h-9 w-full" />}
        </Card>
      ))}
    </section>
  );
}

export function SalesRepsTableSkeleton() {
  return (
    <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent shadow-none">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-800/80 p-3.5">
        <SkeletonBar className="h-9 w-full max-w-sm" />
        <SkeletonBar className="h-9 w-[140px]" />
        <SkeletonBar className="h-9 w-[150px]" />
        <SkeletonBar className="ml-auto h-9 w-24" />
      </div>
      <div className="space-y-0 p-3.5">
        <SkeletonBar className="mb-3 h-8 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBar key={i} className="mb-2 h-14 w-full rounded-sm" />
        ))}
      </div>
    </Card>
  );
}

export default function SalesRepsPageSkeleton() {
  return (
    <>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-40" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <SkeletonBar className="h-9 w-36" />
      </section>
      <SalesRepStatsSkeleton />
      <SalesRepsTableSkeleton />
    </>
  );
}
