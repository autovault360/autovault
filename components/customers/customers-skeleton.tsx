import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-800/50 bg-transparent p-3 text-slate-200 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
      <SkeletonBar className="mt-1 h-9 w-full" />
      <SkeletonBar className="mt-auto -mx-3 -mb-3 h-10 rounded-b-sm" />
    </Card>
  );
}

export function CustomerStatsSkeleton() {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </section>
  );
}

export function CustomersTableSkeleton() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBar className="h-9 w-full max-w-sm" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-28" />
      </div>
      <div className="py-3.5">
        <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent shadow-none">
          <div className="space-y-0 p-3.5">
            <SkeletonBar className="mb-3 h-10 w-full" />
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonBar key={i} className="mb-2 h-14 w-full rounded-sm" />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-800/80 px-3.5 py-3">
            <SkeletonBar className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-8 w-[72px]" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CustomersPageSkeleton() {
  return (
    <div className="relative">
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
            <div className="space-y-2">
              <SkeletonBar className="h-8 w-40" />
              <SkeletonBar className="h-4 w-72" />
            </div>
            <SkeletonBar className="h-9 w-36" />
          </section>
          <CustomerStatsSkeleton />
          <CustomersTableSkeleton />
        </div>
      </div>
    </div>
  );
}
