"use client";

import Link from "next/link";
import { CardShell } from "@/components/dashboard/card-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ITeamMessage } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

type Props = {
  messages: ITeamMessage[];
  loading?: boolean;
};

export default function TeamMessagesCard({ messages, loading }: Props) {
  return (
    <CardShell>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          TEAM MESSAGES
        </span>
        <Link
          href="/sales-rep/messages"
          className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          + New Message
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2.5">
              <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBar className="h-3 w-28" />
                <SkeletonBar className="h-2.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Link
              key={msg.id}
              href={`/sales-rep/messages?conversation=${msg.id}`}
              className="flex gap-2.5 rounded-lg border border-transparent p-1 transition hover:border-slate-800 hover:bg-slate-800/30"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-slate-700 text-[10px] font-medium text-slate-300">
                  {msg.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-medium text-slate-200">
                    {msg.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                  {msg.message}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/sales-rep/messages"
        className="mt-3 block w-full rounded-b-sm border-t border-slate-700 py-2.5 text-center text-[11.5px] font-medium text-blue-400 hover:bg-slate-800/30"
      >
        View All Messages ...
      </Link>
    </CardShell>
  );
}
