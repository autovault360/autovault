import { Card } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-slate-800/60 ${className ?? ""}`} />
  );
}

export default function ReportsLoading() {
  return (
    <div>
      <SkeletonBlock className="mb-3.5 h-10 w-full" />
      <SkeletonBlock className="mb-3.5 h-14 w-full max-w-2xl" />
      <div className="mb-3.5 flex gap-2.5 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="h-28 w-[220px] shrink-0 rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none"
          >
            <SkeletonBlock className="h-full w-full" />
          </Card>
        ))}
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="h-56 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none"
          >
            <SkeletonBlock className="h-full w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
