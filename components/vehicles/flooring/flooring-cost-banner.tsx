import { Layers } from "lucide-react";
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
  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center justify-center gap-[34px] overflow-hidden rounded-xl border border-slate-700/80 bg-[#101826] px-[26px] py-[18px]",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-500",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Layers className="h-[18px] w-[18px] shrink-0 text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-slate-400">
          Flooring Cost
        </span>
      </div>

      <div className="h-[38px] w-px bg-slate-700" />

      <div className="text-center">
        <div className="cursor-pointer font-mono text-[26px] font-extrabold tabular-nums text-blue-500 transition-opacity hover:opacity-80">
          {formatCurrencyDecimal(summary.totalFlooringCost)}
        </div>
        <div className="mt-[3px] text-[10px] uppercase tracking-[1px] text-slate-400">
          Total Flooring Cost
        </div>
      </div>

      <div className="h-[38px] w-px bg-slate-700" />

      <p className="max-w-[260px] text-[11.5px] leading-relaxed text-slate-400">
        Floor-plan interest accrues daily per vehicle and is deducted from net profit. Treated as a cost.
      </p>
    </div>
  );
}
