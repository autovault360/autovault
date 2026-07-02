import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export function ExpenseStatsSkeleton() {
  return (
    <section className="mb-[22px] grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card
          key={i}
          className="rounded-[14px] border border-slate-800/50 bg-transparent p-3.5 shadow-none"
        >
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="mt-2 h-6 w-28" />
          <SkeletonBar className="mt-2 h-3 w-32" />
        </Card>
      ))}
    </section>
  );
}

export function ExpensesTableSkeleton() {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <SkeletonBar className="h-10 w-36" />
        <SkeletonBar className="h-4 w-80 max-w-full" />
      </div>
      <div className="mb-3.5 flex flex-wrap gap-2">
        <SkeletonBar className="h-9 w-full max-w-sm" />
        <SkeletonBar className="h-9 w-[150px]" />
        <SkeletonBar className="h-9 w-[130px]" />
        <SkeletonBar className="h-9 w-[170px]" />
      </div>
      <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent shadow-none">
        <div className="space-y-0 p-3.5">
          <SkeletonBar className="mb-3 h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBar key={i} className="mb-2 h-14 w-full rounded-sm" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ExpensesPageSkeleton() {
  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-[1320px]">
        <section className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-8 w-40" />
          </div>
          <SkeletonBar className="h-4 w-36" />
        </section>
        <SkeletonBar className="mb-[22px] h-24 w-full rounded-[14px]" />
        <ExpenseStatsSkeleton />
        <SkeletonBar className="mb-3.5 h-5 w-56" />
        <SkeletonBar className="mb-[22px] h-48 w-full rounded-[14px]" />
        <ExpensesTableSkeleton />
      </div>
    </div>
  );
}
