import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

const CARD_COUNT = 6;

export default function InventoryPageSkeleton() {
  return (
    <DealerPageShell
      title="Inventory Overview"
      description="Manage wholesale inventory, titles, and pipeline status."
    >
      <KpiGridSkeleton count={CARD_COUNT} className="mb-3.5" />

      <div className="rounded-sm border border-slate-800 bg-card p-3.5">
        <Bar className="mb-3 h-9 w-full max-w-sm" />
        <Bar className="mb-3 h-9 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Bar key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </DealerPageShell>
  );
}
