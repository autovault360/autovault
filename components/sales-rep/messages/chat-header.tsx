"use client";

import { Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MessageParticipant } from "@/lib/sales-rep/messages/types";

type Props = {
  participant: MessageParticipant;
};

export default function ChatHeader({ participant }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0a1524] px-5 py-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {participant.imageUrl ? (
            <AvatarImage src={participant.imageUrl} alt={participant.fullName} />
          ) : null}
          <AvatarFallback className="bg-slate-700 text-sm font-semibold text-slate-200">
            {participant.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-[15px] font-semibold text-white">
            {participant.fullName}
          </h2>
          <p className="text-[12px] text-slate-500">
            {participant.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Contact info"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  );
}
