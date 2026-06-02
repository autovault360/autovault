"use client";

import { cn } from "@/lib/utils";
import type { SalesTaxTab } from "@/lib/sales-tax/types";

type TabItem = { id: SalesTaxTab; label: string };

type Props = {
  tabs: TabItem[];
  activeTab: SalesTaxTab;
  onTabChange: (tab: SalesTaxTab) => void;
};

export default function SalesTaxTabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-[12px] font-medium transition-colors whitespace-nowrap",
              isActive ? "text-white" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
