"use client";

import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ITeamMessage } from "@/lib/sales-rep/dashboard/types";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-800/80" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800/80" />
          <div className="h-2.5 w-12 animate-pulse rounded bg-slate-800/60" />
        </div>
        <div className="h-2.5 w-full animate-pulse rounded bg-slate-800/60" />
      </div>
    </div>
  );
}

type Props = {
  messages: ITeamMessage[];
  loading?: boolean;
};

export default function TeamMessagesCard({ messages, loading }: Props) {
  return (
    <CardShell className="flex flex-col border border-slate-700/60 p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-3">
        <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500">
          TEAM MESSAGES
        </span>
        <Link
          href="/sales-rep/messages"
          className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Messages List */}
      <div className="flex-1 divide-y divide-slate-800/30">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-2 h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No messages</p>
            <p className="text-xs text-slate-600 mt-1">Start a new conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Link
              key={msg.id}
              href={`/sales-rep/messages?conversation=${msg.id}`}
              className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-800/20"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-slate-700 text-[10px] font-medium text-slate-300">
                  {msg.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12px] font-medium text-slate-200">
                    {msg.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/50 px-4 py-2.5">
        <Link
          href="/sales-rep/messages"
          className="flex w-full items-center justify-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 py-2 text-[11px] font-bold text-blue-400 hover:bg-slate-800/60 hover:text-blue-300 transition-colors"
        >
          View All Messages
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </CardShell>
  );
}
