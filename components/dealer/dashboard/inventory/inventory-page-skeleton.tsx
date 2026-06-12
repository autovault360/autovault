import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import { cn } from "@/lib/utils";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";

function Bar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function InventoryPageSkeleton() {
  return (
    <DealerPageShell
      title="Inventory Overview"
      description="Manage wholesale inventory, titles, and pipeline status."
    >
      <div className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn("rounded-sm border p-3", ADMIN_PANEL_SHELL_CLASS)}
          >
            <Bar className="mb-2 h-10 w-10 rounded-full" />
            <Bar className="h-4 w-24" />
          </div>
        ))}
      </div>

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
