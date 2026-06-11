"use client";

import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMessageTime, truncatePreview } from "@/lib/sales-rep/messages/calculations";
import type { TeamChatInfo } from "@/lib/sales-rep/team-chat/types";

type Props = {
  chat: TeamChatInfo | null;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
};

export default function TeamChatSidebar({
  chat,
  search,
  onSearchChange,
  loading,
}: Props) {
  const hasPreview = Boolean(chat?.lastMessageText || chat?.lastMessageAt);
  const unreadCount = chat?.unreadCount ?? 0;

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-slate-800/80 bg-[#0a1524]">
      <div className="border-b border-slate-800/80 px-4 pb-4 pt-5">
        <h1 className="text-[17px] font-semibold text-white">Team Chat</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          Group messaging with your entire team.
        </p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-10 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex animate-pulse gap-3 px-4 py-3.5">
            <div className="h-10 w-10 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-slate-800" />
              <div className="h-2.5 w-full rounded bg-slate-800/80" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "flex w-full items-start gap-3 border-b border-slate-800/60 px-4 py-3.5 text-left",
              "bg-blue-500/10",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/80 ring-1 ring-slate-600/50">
              <Users className="h-4 w-4 text-slate-200" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "truncate text-[13.5px] font-semibold",
                    unreadCount > 0 ? "text-white" : "text-slate-200",
                  )}
                >
                  {chat?.name ?? "Team Chat"}
                </span>
                {hasPreview && (
                  <span className="shrink-0 text-[11px] text-slate-500">
                    {formatMessageTime(chat?.lastMessageAt ?? chat?.createdAt)}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "line-clamp-1 text-[12px]",
                    unreadCount > 0 ? "font-medium text-slate-300" : "text-slate-500",
                  )}
                >
                  {hasPreview
                    ? truncatePreview(chat?.lastMessageText ?? null)
                    : "Say hello to your team"}
                </p>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
