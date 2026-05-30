import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export function VehicleStatsSkeleton() {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
        </Card>
      ))}
    </section>
  );
}

export function VehiclesTableSkeleton() {
  return (
    <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent shadow-none">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-800/80 p-3.5">
        <SkeletonBar className="h-9 w-full max-w-sm" />
        <SkeletonBar className="h-9 w-[120px]" />
        <SkeletonBar className="h-9 w-[120px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="ml-auto h-9 w-24" />
      </div>
      <div className="space-y-0 p-3.5">
        <SkeletonBar className="mb-3 h-8 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-2 flex items-center gap-3 rounded-sm">
            <SkeletonBar className="h-12 w-16 shrink-0 rounded-md" />
            <SkeletonBar className="h-12 flex-1 rounded-sm" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function VehiclesPageSkeleton() {
  return (
    <>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-44" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <SkeletonBar className="h-9 w-36" />
          <SkeletonBar className="h-9 w-20" />
        </div>
      </section>
      <VehicleStatsSkeleton />
      <VehiclesTableSkeleton />
    </>
  );
}
