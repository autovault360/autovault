import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function AdminHeaderSkeleton() {
  return (
    <header className="mb-3.5 flex justify-between items-center gap-3 border-b border-slate-800 pb-3.5 xl:gap-4">
      <SkeletonBar className="h-10 w-full max-w-[400px]" />
      <div className="hidden xl:flex xl:flex-col xl:items-center xl:gap-1.5">
        <SkeletonBar className="h-3 w-24" />
        <div className="flex gap-2">
          <SkeletonBar className="h-8 w-36" />
          <SkeletonBar className="h-8 w-36" />
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-8 w-40" />
          <SkeletonBar className="h-8 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SkeletonBar className="h-8 w-8 rounded-full" />
        <SkeletonBar className="h-8 w-8 rounded-full" />
      </div>
    </header>
  );
}

export function SalesRepStatsSkeleton() {
  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-700 bg-transparent p-3 shadow-none">
        <div className="flex items-start gap-2.5">
          <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonBar className="h-3 w-28" />
            <SkeletonBar className="h-5 w-12" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        </div>
      </Card>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-700 bg-transparent p-3 text-slate-200 shadow-none">
          <div className="flex items-start gap-2.5">
            <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <SkeletonBar className="h-3 w-28" />
              <SkeletonBar className="h-5 w-20" />
              <SkeletonBar className="h-3 w-24" />
            </div>
          </div>
          <SkeletonBar className="mt-1 h-9 w-full" />
        </Card>
      ))}
    </section>
  );
}

export function SalesRepsTableSkeleton() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBar className="h-9 w-full max-w-sm flex-1 sm:flex-none" />
        <SkeletonBar className="h-9 w-[140px]" />
        <SkeletonBar className="h-9 w-[150px]" />
        <SkeletonBar className="ml-auto h-9 w-24" />
      </div>
      <div className="py-3.5">
        <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent shadow-none">
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

export default function SalesRepsPageSkeleton() {
  return (
    <div className="relative">
      <AdminHeaderSkeleton />
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-40" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <SkeletonBar className="h-9 w-36" />
      </section>
      <SalesRepStatsSkeleton />
      <SalesRepsTableSkeleton />
    </div>
  );
}
