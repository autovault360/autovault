import { formatCurrencyDecimal } from "@/lib/vehicles/types";
import type { FlooringSummary } from "@/lib/vehicles/flooring/types";
import { cn } from "@/lib/utils";

export default function FlooringCostBanner({
  summary,
  className,
}: {
  summary: FlooringSummary;
  className?: string;
}) {
  if (summary.vehicleCount === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/40 bg-gradient-to-r from-red-950/80 via-red-900/40 to-red-950/60 px-4 py-3",
        className,
      )}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300/90">
          Flooring Cost
        </p>
        {summary.planName ? (
          <p className="mt-0.5 text-[11px] text-red-200/70">
            Active plan: {summary.planName} {'\u00B7'} {summary.vehicleCount} vehicle
            {summary.vehicleCount === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mt-0.5 text-[11px] text-red-200/70">
            {summary.vehicleCount} financed vehicle
            {summary.vehicleCount === 1 ? "" : "s"} in inventory
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-red-300/80">
          Total Flooring Cost
        </p>
        <p className="text-[22px] font-bold tabular-nums text-red-400">
          -{formatCurrencyDecimal(summary.totalFlooringCost)}
        </p>
      </div>
    </div>
  );
}
