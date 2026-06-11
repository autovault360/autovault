"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ConversationList from "./conversation-list";
import ChatHeader from "./chat-header";
import ChatThread from "./chat-thread";
import MessageComposer from "./message-composer";
import ContactSidebar from "./contact-sidebar";
import EmptyChatState from "./empty-chat-state";
import type {
  ChatMessage,
  ConversationDetail,
  ConversationListItem,
  ConversationTab,
} from "@/lib/sales-rep/messages/types";

const POLL_INTERVAL_MS = 30_000;

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ConversationTab>("all");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeRepId, setActiveRepId] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const realtimeEnabledRef = useRef(true);

  const fetchConversations = useCallback(async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "100",
      tab: activeTab,
    });
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/messages/conversations?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setConversations(data.conversations ?? []);
    setTotalUnread(data.totalUnread ?? 0);
  }, [activeTab, search]);

  const fetchConversationDetail = useCallback(async (conversationId: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/messages/conversation/${conversationId}`);
      if (!res.ok) return;
      const data = (await res.json()) as ConversationDetail;
      setConversationDetail(data);
      setActiveRepId(data.otherParticipant.id);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    await fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    await fetchConversations();
  }, [fetchConversations]);

  const openConversation = useCallback(
    async (conversationId: string, repId?: string) => {
      setActiveConversationId(conversationId);
      if (repId) setActiveRepId(repId);
      await fetchConversationDetail(conversationId);
      await markAsRead(conversationId);
    },
    [fetchConversationDetail, markAsRead],
  );

  const handleSelectEntry = useCallback(
    async (entry: ConversationListItem) => {
      setActiveRepId(entry.repId);

      if (entry.conversationId) {
        await openConversation(entry.conversationId, entry.repId);
        return;
      }

      setActiveConversationId(null);
      setConversationDetail(null);
    },
    [openConversation],
  );

  const handleSend = useCallback(
    async (message: string) => {
      if (!activeRepId && !activeConversationId) return;

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId ?? undefined,
          recipientId: activeConversationId ? undefined : activeRepId,
          message,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "Failed to send message.");
        return;
      }
      const data = await res.json();
      const conversationId = data.conversationId ?? activeConversationId;

      if (conversationId) {
        setActiveConversationId(conversationId);
      }

      setConversationDetail((prev) => {
        const message = data.message as ChatMessage;
        if (prev) {
          return {
            ...prev,
            messages: [...prev.messages, message],
            stats: {
              ...prev.stats,
              totalMessages: prev.stats.totalMessages + 1,
            },
          };
        }

        const participant =
          conversations.find((entry) => entry.repId === activeRepId)?.otherParticipant ??
          null;

        if (!participant) return prev;

        return {
          id: conversationId,
          createdAt: new Date().toISOString(),
          participants: [participant],
          otherParticipant: participant,
          messages: [message],
          hasMore: false,
          nextCursor: null,
          stats: {
            totalMessages: 1,
            unreadMessages: 0,
            conversationStarted: new Date().toISOString(),
            lastActiveAt: message.createdAt,
          },
        };
      });

      if (conversationId) {
        await fetchConversationDetail(conversationId);
      }

      await fetchConversations();
    },
    [
      activeConversationId,
      activeRepId,
      conversations,
      fetchConversationDetail,
      fetchConversations,
    ],
  );

  const handleLoadMore = useCallback(async () => {
    if (!activeConversationId || !conversationDetail?.hasMore || !conversationDetail.nextCursor) {
      return;
    }

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        cursor: conversationDetail.nextCursor,
        limit: "50",
      });
      const res = await fetch(
        `/api/messages/conversation/${activeConversationId}?${params.toString()}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as ConversationDetail;

      setConversationDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...data.messages, ...prev.messages],
          hasMore: data.hasMore,
          nextCursor: data.nextCursor,
        };
      });
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversationId, conversationDetail]);

  useEffect(() => {
    setListLoading(true);
    fetchConversations().finally(() => setListLoading(false));
  }, [fetchConversations]);

  useEffect(() => {
    if (!initialConversationId || activeConversationId) return;
    void openConversation(initialConversationId);
  }, [initialConversationId, activeConversationId, openConversation]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("sales-rep-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          void fetchConversations();
          if (activeConversationId) {
            void fetchConversationDetail(activeConversationId);
            if (document.hasFocus()) {
              void markAsRead(activeConversationId);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          void fetchConversations();
        },
      )
      .subscribe((status) => {
        realtimeEnabledRef.current = status === "SUBSCRIBED";
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    activeConversationId,
    fetchConversations,
    fetchConversationDetail,
    markAsRead,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (realtimeEnabledRef.current) return;
      void fetchConversations();
      if (activeConversationId) {
        void fetchConversationDetail(activeConversationId);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeConversationId, fetchConversations, fetchConversationDetail]);

  const participant =
    conversationDetail?.otherParticipant ??
    conversations.find((entry) => entry.repId === activeRepId)?.otherParticipant ??
    null;

  const showChat = Boolean(activeRepId && participant);

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[560px] overflow-hidden rounded-xl border border-slate-800/80 bg-[#010d19]">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        activeRepId={activeRepId}
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalUnread={totalUnread}
        selectEntry={handleSelectEntry}
        loading={listLoading}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {showChat ? (
          <>
            <ChatHeader participant={participant!} />
            {threadLoading && !conversationDetail ? (
              <div className="flex flex-1 items-center justify-center text-[13px] text-slate-500">
                Loading conversation...
              </div>
            ) : (
              <ChatThread
                messages={conversationDetail?.messages ?? []}
                participant={participant!}
                hasMore={conversationDetail?.hasMore ?? false}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
              />
            )}
            <MessageComposer
              onSend={handleSend}
              disabled={!activeRepId}
            />
          </>
        ) : (
          <EmptyChatState />
        )}
      </div>

      {showChat ? (
        <ContactSidebar
          participant={participant!}
          stats={conversationDetail?.stats ?? null}
        />
      ) : (
        <div className="hidden w-[300px] shrink-0 border-l border-slate-800/80 bg-[#0a1524] xl:block" />
      )}
    </div>
  );
}
