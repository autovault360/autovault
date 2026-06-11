"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  formatRelativeTime,
} from "@/lib/sales-rep/messages/calculations";
import type { ConversationStats, MessageParticipant } from "@/lib/sales-rep/messages/types";

type Props = {
  participant: MessageParticipant;
  stats: ConversationStats | null;
};

function formatConversationStarted(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContactSidebar({ participant, stats }: Props) {
  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-800/80 bg-[#0a1524] p-4">
      <CardShell className="!p-4">
        <div className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-500">
          CONTACT DETAILS
        </div>
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16">
            {participant.imageUrl ? (
              <AvatarImage src={participant.imageUrl} alt={participant.fullName} />
            ) : null}
            <AvatarFallback className="bg-slate-700 text-base font-semibold text-slate-200">
              {participant.initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-[15px] font-semibold text-white">
            {participant.fullName}
          </h3>
          <p className="text-[12px] text-slate-500">{participant.role}</p>
        </div>
        <dl className="mt-4 space-y-3 border-t border-slate-800/80 pt-4">
          <div>
            <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500">EMAIL</dt>
            <dd className="mt-1 break-all text-[12.5px] text-slate-300">
              {participant.email}
            </dd>
          </div>
          {participant.phone && (
            <div>
              <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500">PHONE</dt>
              <dd className="mt-1 text-[12.5px] text-slate-300">{participant.phone}</dd>
            </div>
          )}
        </dl>
      </CardShell>

      <CardShell className="!p-4">
        <div className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-500">
          STATISTICS
        </div>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-[12px] text-slate-500">Total Messages</dt>
            <dd className="text-[13px] font-semibold text-slate-200">
              {stats?.totalMessages ?? 0}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[12px] text-slate-500">Unread Messages</dt>
            <dd className="text-[13px] font-semibold text-slate-200">
              {stats?.unreadMessages ?? 0}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[12px] text-slate-500">Conversation Started</dt>
            <dd className="text-right text-[12px] font-medium text-slate-300">
              {formatConversationStarted(stats?.conversationStarted)}
            </dd>
          </div>
        </dl>
      </CardShell>

      <CardShell className="!p-4">
        <div className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-500">
          RECENT ACTIVITY
        </div>
        <p className="text-[12.5px] text-slate-400">
          Last active:{" "}
          <span className="font-medium text-slate-200">
            {formatRelativeTime(stats?.lastActiveAt ?? participant.lastActiveAt)}
          </span>
        </p>
      </CardShell>
    </div>
  );
}
