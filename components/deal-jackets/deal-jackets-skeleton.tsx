import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

export function DealJacketsTableSkeleton() {
  return (
    <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent shadow-none">
      <div className="space-y-3.5 p-3.5">
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBar key={i} className="h-8 w-40 rounded-md" />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <SkeletonBar className="h-9 min-w-[240px] flex-1 sm:max-w-xl" />
          <SkeletonBar className="h-9 w-[150px]" />
          <SkeletonBar className="h-9 w-[170px]" />
          <SkeletonBar className="h-9 w-52" />
          <SkeletonBar className="h-9 w-24" />
        </div>
      </div>
      <div className="px-3.5 pb-3.5">
        <SkeletonBar className="mb-3 h-10 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="mb-2 flex items-center gap-3 rounded-sm">
            <SkeletonBar className="h-11 w-16 shrink-0 rounded-md" />
            <SkeletonBar className="h-11 flex-1 rounded-sm" />
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 px-1 pt-3">
          <SkeletonBar className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-8 w-[72px]" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DealJacketsPageSkeleton() {
  return (
    <div className="relative">
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <SkeletonBar className="mt-0.5 h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <SkeletonBar className="h-8 w-44" />
            <SkeletonBar className="h-4 w-72" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-9 w-24" />
          <SkeletonBar className="h-9 w-24" />
        </div>
      </section>
      <DealJacketsTableSkeleton />
    </div>
  );
}
