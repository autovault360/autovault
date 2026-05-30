"use client";

import { cn } from "@/lib/utils";
import {
  DEAL_JACKET_TABS,
  type DealJacketTab,
  type DealJacketTabCounts,
} from "@/lib/deal-jackets/types";

type Props = {
  activeTab: DealJacketTab;
  counts: DealJacketTabCounts;
  onChange: (tab: DealJacketTab) => void;
};

const TAB_BADGE_COLORS: Partial<Record<DealJacketTab, string>> = {
  pending_commission: "bg-amber-500/20 text-amber-400",
  commission_paid: "bg-emerald-500/20 text-emerald-400",
};

export default function DealJacketFilterTabs({
  activeTab,
  counts,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3.5">
      {DEAL_JACKET_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const badgeColor = TAB_BADGE_COLORS[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[11.5px] font-medium transition-colors",
              isActive
                ? "border-blue-500/50 bg-blue-500/15 text-white"
                : "border-slate-700 bg-[#0e1626]/60 text-slate-400 hover:border-slate-600 hover:text-slate-200",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                isActive
                  ? badgeColor ?? "bg-blue-500/25 text-blue-300"
                  : badgeColor ?? "bg-slate-800 text-slate-500",
              )}
            >
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
