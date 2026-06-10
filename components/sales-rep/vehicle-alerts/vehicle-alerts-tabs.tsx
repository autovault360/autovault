"use client";

import { cn } from "@/lib/utils";
import type { VehicleAlertTab } from "@/lib/sales-rep/vehicle-alerts/types";

const TAB_LABELS: Record<VehicleAlertTab, string> = {
  all_pending: "All Pending",
  pending_documents: "Pending Documents",
  under_review: "Under Review",
  needs_changes: "Needs Changes",
};

type Props = {
  activeTab: VehicleAlertTab;
  tabCounts: Record<VehicleAlertTab, number>;
  onTabChange: (tab: VehicleAlertTab) => void;
};

export default function VehicleAlertsTabs({
  activeTab,
  tabCounts,
  onTabChange,
}: Props) {
  const tabs = Object.keys(TAB_LABELS) as VehicleAlertTab[];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-800/80">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative px-3 py-2.5 text-[12px] font-medium transition-colors",
              isActive
                ? "text-blue-400"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {TAB_LABELS[tab]}
            <span className="ml-1 text-slate-500">({tabCounts[tab]})</span>
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
