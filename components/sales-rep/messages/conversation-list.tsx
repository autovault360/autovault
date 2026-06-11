"use client";

import ConversationItem from "./conversation-item";
import ConversationSearch from "./conversation-search";
import type { ConversationListItem, ConversationTab } from "@/lib/sales-rep/messages/types";

type Props = {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  activeRepId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: ConversationTab;
  onTabChange: (tab: ConversationTab) => void;
  totalUnread: number;
  selectEntry: (entry: ConversationListItem) => void;
  loading?: boolean;
};

export default function ConversationList({
  conversations,
  activeConversationId,
  activeRepId,
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  totalUnread,
  selectEntry,
  loading,
}: Props) {
  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-slate-800/80 bg-[#0a1524]">
      <ConversationSearch
        search={search}
        onSearchChange={onSearchChange}
        activeTab={activeTab}
        onTabChange={onTabChange}
        unreadCount={totalUnread}
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-slate-800" />
                  <div className="h-2.5 w-full rounded bg-slate-800/80" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-slate-500">
            {activeTab === "unread"
              ? "No unread conversations."
              : search.trim()
                ? "No sales reps match your search."
                : "No other sales reps found in your dealership."}
          </div>
        ) : (
          <>
            {!search.trim() && activeTab === "all" && (
              <div className="px-4 py-2 text-[10px] font-bold tracking-[0.12em] text-slate-500">
                SALES REPS
              </div>
            )}
            {conversations.map((entry) => (
              <ConversationItem
                key={entry.repId}
                conversation={entry}
                isActive={
                  entry.conversationId === activeConversationId ||
                  entry.repId === activeRepId
                }
                onItemClick={() => selectEntry(entry)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
