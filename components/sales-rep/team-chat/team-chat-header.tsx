"use client";

import { Info, Users } from "lucide-react";
import type { TeamChatInfo } from "@/lib/sales-rep/team-chat/types";

type Props = {
  chat: TeamChatInfo;
};

export default function TeamChatHeader({ chat }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0a1524] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700/80 ring-1 ring-slate-600/50">
          <Users className="h-5 w-5 text-slate-200" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">{chat.name}</h2>
          <p className="text-[12px] text-slate-500">
            {chat.memberCount} Member{chat.memberCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Chat info"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  );
}
