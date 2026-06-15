import { cn } from "@/lib/utils";
import {
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function KpiGridSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={kpiGridClass(count, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn("rounded-sm border p-3", KPI_CARD_SHELL_CLASS)}
        >
          <SkeletonBar className="mb-2 h-10 w-10 rounded-full" />
          <SkeletonBar className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
