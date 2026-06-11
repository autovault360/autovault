"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationTab } from "@/lib/sales-rep/messages/types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: ConversationTab;
  onTabChange: (tab: ConversationTab) => void;
  unreadCount: number;
};

export default function ConversationSearch({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  unreadCount,
}: Props) {
  const tabs: { id: ConversationTab; label: string; badge?: number }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", badge: unreadCount },
  ];

  return (
    <div className="border-b border-slate-800/80 bg-[#0a1524]">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sales reps..."
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-10 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <button
          type="button"
          aria-label="Filter conversations"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:text-slate-200"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-6 px-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative pb-3 text-[13px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-blue-400"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1.5 text-[11px] text-slate-500">({tab.badge})</span>
            )}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
