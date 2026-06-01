"use client";

import { cn } from "@/lib/utils";
import type { PlTab } from "@/lib/profit-loss/types";

const TABS: { id: PlTab; label: string }[] = [
  { id: "statement", label: "P&L Statement" },
  { id: "revenue", label: "Revenue Breakdown" },
  { id: "expense", label: "Expense Breakdown" },
  { id: "trends", label: "Trends" },
];

type Props = {
  activeTab: PlTab;
  onTabChange: (tab: PlTab) => void;
};

export default function ProfitLossTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-[12px] font-medium transition-colors",
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
