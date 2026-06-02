import { Card } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-slate-800/60 ${className ?? ""}`} />;
}

export default function CalendarLoading() {
  return (
    <div>
      <SkeletonBlock className="mb-3.5 h-10 w-full" />
      <SkeletonBlock className="mb-3.5 h-20 w-full" />
      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="h-24 rounded-sm border border-slate-700 bg-transparent p-3 shadow-none"
          >
            <SkeletonBlock className="h-full w-full" />
          </Card>
        ))}
      </div>
      <div className="grid gap-3.5 xl:grid-cols-12">
        <Card className="col-span-8 h-96 rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
          <SkeletonBlock className="h-full w-full" />
        </Card>
        <Card className="col-span-4 h-96 rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
          <SkeletonBlock className="h-full w-full" />
        </Card>
      </div>
    </div>
  );
}
