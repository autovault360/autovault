"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SoldVehicleTab } from "@/lib/sales-rep/sold-vehicles/types";

type TabDef = {
  id: SoldVehicleTab;
  label: string;
  count?: number;
  icon?: boolean;
};

type Props = {
  activeTab: SoldVehicleTab;
  tabCounts: Record<SoldVehicleTab, number>;
  customRangeLabel?: string;
  onTabChange: (tab: SoldVehicleTab) => void;
  onCustomRangeClick: () => void;
};

export default function SoldVehiclesTabs({
  activeTab,
  tabCounts,
  customRangeLabel,
  onTabChange,
  onCustomRangeClick,
}: Props) {
  const tabs: TabDef[] = [
    { id: "all", label: "All Sold", count: tabCounts.all },
    { id: "this_month", label: "This Month", count: tabCounts.this_month },
    { id: "last_month", label: "Last Month", count: tabCounts.last_month },
    { id: "this_year", label: "This Year", count: tabCounts.this_year },
    { id: "custom", label: customRangeLabel ?? "Custom Range", icon: true },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-800/80">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isCustom = tab.id === "custom";

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => (isCustom ? onCustomRangeClick() : onTabChange(tab.id))}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors",
              isActive
                ? "text-blue-400"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab.icon && <Calendar className="h-3.5 w-3.5" />}
            <span>
              {tab.label}
              {tab.count != null && !isCustom && (
                <span className="ml-1 text-slate-500">({tab.count})</span>
              )}
            </span>
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
