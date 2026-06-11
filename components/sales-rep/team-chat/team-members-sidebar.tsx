"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardShell } from "@/components/dashboard/card-shell";
import type { TeamChatInfo, TeamChatMember } from "@/lib/sales-rep/team-chat/types";

type Props = {
  chat: TeamChatInfo;
  members: TeamChatMember[];
};

const INITIAL_VISIBLE = 8;

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TeamMembersSidebar({ chat, members }: Props) {
  const [showAllMembers, setShowAllMembers] = useState(false);
  const visibleMembers = showAllMembers ? members : members.slice(0, INITIAL_VISIBLE);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-800/80 bg-[#0a1524] p-4">
      <CardShell className="!p-4">
        <div className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-500">
          ABOUT THIS CHAT
        </div>
        <p className="text-[12.5px] leading-relaxed text-slate-400">{chat.description}</p>
        <dl className="mt-4 space-y-3 border-t border-slate-800/80 pt-4">
          <div>
            <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500">CREATED</dt>
            <dd className="mt-1 text-[12.5px] text-slate-300">
              {formatCreatedDate(chat.createdAt)}
            </dd>
          </div>
          {chat.createdByName && (
            <div>
              <dt className="text-[10px] font-bold tracking-[0.1em] text-slate-500">
                CREATED BY
              </dt>
              <dd className="mt-1 text-[12.5px] text-slate-300">{chat.createdByName}</dd>
            </div>
          )}
        </dl>
      </CardShell>

      <CardShell className="!p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.12em] text-slate-500">
            TEAM MEMBERS ({members.length})
          </span>
        </div>

        <ul className="space-y-3">
          {visibleMembers.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                {member.imageUrl ? (
                  <AvatarImage src={member.imageUrl} alt={member.fullName} />
                ) : null}
                <AvatarFallback className="bg-slate-700 text-[10px] font-semibold text-slate-200">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-200">
                  {member.fullName}
                </p>
                <p className="truncate text-[11px] text-slate-500">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>

        {members.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => setShowAllMembers((prev) => !prev)}
            className="mt-4 text-[12px] font-medium text-blue-400 transition hover:text-blue-300"
          >
            {showAllMembers ? "Show fewer members" : "View all members"}
          </button>
        )}
      </CardShell>
    </div>
  );
}
