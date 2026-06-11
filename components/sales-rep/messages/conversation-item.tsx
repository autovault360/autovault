"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatMessageTime, truncatePreview } from "@/lib/sales-rep/messages/calculations";
import type { ConversationListItem } from "@/lib/sales-rep/messages/types";

type Props = {
  conversation: ConversationListItem;
  isActive: boolean;
  onItemClick: () => void;
};

export default function ConversationItem({
  conversation,
  isActive,
  onItemClick,
}: Props) {
  const { otherParticipant, lastMessageText, lastMessageAt, unreadCount, createdAt } =
    conversation;
  const hasMessages = Boolean(lastMessageText || lastMessageAt);

  return (
    <button
      type="button"
      onClick={onItemClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-slate-800/60 px-4 py-3.5 text-left transition-colors",
        isActive ? "bg-blue-500/10" : "hover:bg-slate-800/40",
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        {otherParticipant.imageUrl ? (
          <AvatarImage src={otherParticipant.imageUrl} alt={otherParticipant.fullName} />
        ) : null}
        <AvatarFallback className="bg-slate-700 text-[11px] font-semibold text-slate-200">
          {otherParticipant.initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "truncate text-[13.5px] font-semibold",
              unreadCount > 0 ? "text-white" : "text-slate-200",
            )}
          >
            {otherParticipant.fullName}
          </span>
          {hasMessages && (
            <span className="shrink-0 text-[11px] text-slate-500">
              {formatMessageTime(lastMessageAt ?? createdAt)}
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
            {hasMessages
              ? truncatePreview(lastMessageText)
              : "Tap to start a conversation"}
          </p>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
