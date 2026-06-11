"use client";

import { useEffect, useRef } from "react";
import ChatMessageBubble from "@/components/sales-rep/chat/chat-message-bubble";
import { formatDateSeparator } from "@/lib/sales-rep/messages/calculations";
import type { TeamChatMessage } from "@/lib/sales-rep/team-chat/types";

type Props = {
  messages: TeamChatMessage[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  searchQuery?: string;
};

function groupMessagesByDate(
  messages: TeamChatMessage[],
): { date: string; items: TeamChatMessage[] }[] {
  const groups: { date: string; items: TeamChatMessage[] }[] = [];

  for (const message of messages) {
    const dateKey = formatDateSeparator(message.createdAt);
    const last = groups[groups.length - 1];
    if (last?.date === dateKey) {
      last.items.push(message);
    } else {
      groups.push({ date: dateKey, items: [message] });
    }
  }

  return groups;
}

export default function TeamChatThread({
  messages,
  hasMore,
  loadingMore,
  onLoadMore,
  searchQuery = "",
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const prevFirstIdRef = useRef<string | null>(messages[0]?.id ?? null);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleMessages = normalizedSearch
    ? messages.filter((message) =>
        message.messageText.toLowerCase().includes(normalizedSearch),
      )
    : messages;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isPrepend =
      messages.length > prevLengthRef.current &&
      messages[0]?.id !== prevFirstIdRef.current;

    if (isPrepend) {
      const prevHeight = container.scrollHeight;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - prevHeight;
      });
    } else if (messages.length >= prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLengthRef.current = messages.length;
    prevFirstIdRef.current = messages[0]?.id ?? null;
  }, [messages]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !hasMore || loadingMore) return;
    if (container.scrollTop < 80) {
      onLoadMore();
    }
  };

  const groups = groupMessagesByDate(visibleMessages);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-[#010d19] py-2"
    >
      {loadingMore && (
        <div className="py-2 text-center text-[11px] text-slate-500">
          Loading older messages...
        </div>
      )}

      {normalizedSearch && visibleMessages.length === 0 && (
        <div className="px-5 py-10 text-center text-[13px] text-slate-500">
          No messages match your search.
        </div>
      )}

      {groups.map((group) => (
        <div key={group.date}>
          <div className="my-5 flex items-center gap-3 px-5">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] font-medium text-slate-500">{group.date}</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          {group.items.map((message) => (
            <ChatMessageBubble
              key={message.id}
              mode="team"
              sender={message.sender}
              message={{
                id: message.id,
                messageText: message.messageText,
                createdAt: message.createdAt,
                isOwn: message.isOwn,
                pending: message.pending,
                failed: message.failed,
                seenByCount: message.seenByCount,
              }}
            />
          ))}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
