"use client";

import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/sales-rep/messages/calculations";
import type { MessageAttachment, MessageParticipant } from "@/lib/sales-rep/messages/types";
import MessageAttachmentList from "@/components/sales-rep/messages/message-attachment-list";

export type ChatBubbleMessage = {
  id: string;
  messageText: string;
  createdAt: string;
  isOwn: boolean;
  pending?: boolean;
  failed?: boolean;
  isRead?: boolean;
  seenByCount?: number;
  attachments?: MessageAttachment[];
};

type Props = {
  message: ChatBubbleMessage;
  sender: MessageParticipant;
  mode?: "direct" | "team";
};

export default function ChatMessageBubble({ message, sender, mode = "direct" }: Props) {
  const time = formatMessageTime(message.createdAt);

  const statusLabel = message.failed
    ? "Failed to send"
    : message.pending
      ? "Sending..."
      : mode === "team" && message.isOwn
        ? message.seenByCount && message.seenByCount > 0
          ? `Seen by ${message.seenByCount}`
          : "Delivered"
        : message.isOwn
          ? message.isRead
            ? "Read"
            : "Delivered"
          : null;

  const bubbleClassName = cn(
    "inline-block max-w-full rounded-xl px-4 py-2.5 text-[13.5px] leading-relaxed text-slate-100",
    message.isOwn
      ? message.failed
        ? "bg-red-500/80 text-white"
        : "bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.22)]"
      : "bg-[#1a2332] ring-1 ring-slate-700/60",
    message.pending && "opacity-90",
  );

  if (message.isOwn) {
    return (
      <div className="flex justify-end px-5 py-3">
        <div className="min-w-0 max-w-[78%]">
          <div className="mb-2 flex justify-end">
            <span className="text-[11px] text-slate-500">{time}</span>
          </div>

          <div className="flex justify-end">
            <div className={bubbleClassName}>
              {message.messageText}
              {message.attachments && message.attachments.length > 0 && (
                <MessageAttachmentList attachments={message.attachments} />
              )}
            </div>
          </div>

          {statusLabel && (
            <div
              className={cn(
                "mt-2 flex items-center justify-end gap-1.5 text-[10px] text-slate-500",
                message.failed && "text-red-400",
              )}
            >
              {mode === "team" && !message.pending && !message.failed && (
                <Eye className="h-3 w-3" />
              )}
              <span>{statusLabel}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-5 py-3">
      <Avatar className="h-9 w-9 shrink-0">
        {sender.imageUrl ? (
          <AvatarImage src={sender.imageUrl} alt={sender.fullName} />
        ) : null}
        <AvatarFallback className="bg-slate-700 text-[10px] font-semibold text-slate-200">
          {sender.initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 max-w-[78%]">
        <div className="mb-2 flex items-baseline gap-2">
          {mode === "team" && (
            <span className="text-[12px] font-semibold text-slate-200">{sender.fullName}</span>
          )}
          <span className="text-[11px] text-slate-500">{time}</span>
        </div>

        <div className={bubbleClassName}>
          {message.messageText}
          {message.attachments && message.attachments.length > 0 && (
            <MessageAttachmentList attachments={message.attachments} />
          )}
        </div>
      </div>
    </div>
  );
}
