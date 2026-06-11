"use client";

import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/sales-rep/messages/calculations";
import type { ChatMessage, MessageParticipant } from "@/lib/sales-rep/messages/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  message: ChatMessage;
  participant?: MessageParticipant;
};

export default function MessageBubble({ message, participant }: Props) {
  const time = formatMessageTime(message.createdAt);

  if (message.isOwn) {
    return (
      <div className="flex justify-end px-5 py-1">
        <div className="max-w-[70%]">
          <div
            className={cn(
              "rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13.5px] leading-relaxed text-white",
              "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_2px_12px_rgba(59,130,246,0.25)]",
            )}
          >
            {message.messageText}
          </div>
          <div className="mt-1 flex justify-end gap-2 text-[10px] text-slate-500">
            <span>{time}</span>
            <span>{message.isRead ? "Read" : "Delivered"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 px-5 py-1">
      <Avatar className="mt-5 h-8 w-8 shrink-0">
        {participant?.imageUrl ? (
          <AvatarImage src={participant.imageUrl} alt={participant?.fullName} />
        ) : null}
        <AvatarFallback className="bg-slate-700 text-[10px] font-semibold text-slate-200">
          {participant?.initials ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%]">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-[11px] font-medium text-slate-400">
            {participant?.fullName}
          </span>
          <span className="text-[10px] text-slate-600">{time}</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-slate-800/90 px-4 py-2.5 text-[13.5px] leading-relaxed text-slate-100 ring-1 ring-slate-700/50">
          {message.messageText}
        </div>
      </div>
    </div>
  );
}
