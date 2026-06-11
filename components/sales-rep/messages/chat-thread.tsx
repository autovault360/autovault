"use client";

import { useEffect, useRef } from "react";
import { formatDateSeparator } from "@/lib/sales-rep/messages/calculations";
import type { ChatMessage, MessageParticipant } from "@/lib/sales-rep/messages/types";
import MessageBubble from "./message-bubble";

type Props = {
  messages: ChatMessage[];
  participant: MessageParticipant;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

function groupMessagesByDate(messages: ChatMessage[]): { date: string; items: ChatMessage[] }[] {
  const groups: { date: string; items: ChatMessage[] }[] = [];

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

export default function ChatThread({
  messages,
  participant,
  hasMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const prevFirstIdRef = useRef<string | null>(messages[0]?.id ?? null);

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

  const groups = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-[#010d19] py-4"
    >
      {loadingMore && (
        <div className="py-2 text-center text-[11px] text-slate-500">
          Loading older messages...
        </div>
      )}

      {groups.map((group) => (
        <div key={group.date}>
          <div className="my-4 flex items-center gap-3 px-5">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] font-medium text-slate-500">{group.date}</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          {group.items.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              participant={message.isOwn ? undefined : participant}
            />
          ))}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
