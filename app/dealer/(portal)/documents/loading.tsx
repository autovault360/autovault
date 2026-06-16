import { kpiGridClass, KPI_CARD_SHELL_CLASS } from "@/lib/ui/kpi-grid";
import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function DocumentsLoading() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <section className="mb-3.5 border-b border-slate-800/60 px-0.5 pb-3.5">
        <SkeletonBar className="h-6 w-48" />
        <SkeletonBar className="mt-2 h-4 w-72" />
      </section>

      <section className={kpiGridClass(4, "mb-3.5")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className={cn("h-24", KPI_CARD_SHELL_CLASS)} />
        ))}
      </section>

      <SkeletonBar className="mb-3 h-16 w-full" />
      <SkeletonBar className="h-80 w-full" />
    </div>
  );
}
