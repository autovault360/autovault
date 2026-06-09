import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`} />
  );
}

export default function MissingTitlesPageSkeleton() {
  return (
    <div className="min-w-0 space-y-3.5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonBar className="h-8 w-56" />
        <div className="flex gap-2">
          <SkeletonBar className="h-9 w-36" />
          <SkeletonBar className="h-9 w-52" />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={index}
            className="h-28 rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none"
          >
            <SkeletonBar className="h-full w-full" />
          </Card>
        ))}
      </section>
      <SkeletonBar className="h-9 w-full max-w-3xl" />
      <Card className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
        <SkeletonBar className="mb-3 h-10 w-full" />
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBar key={index} className="mb-2 h-14 w-full rounded-sm" />
        ))}
      </Card>
    </div>
  );
}
