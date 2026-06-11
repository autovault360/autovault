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
  MessageParticipant,
} from "@/lib/sales-rep/messages/types";
import { mapProfileToParticipant } from "@/lib/sales-rep/messages/calculations";

const POLL_INTERVAL_MS = 30_000;
const LIST_REFRESH_DEBOUNCE_MS = 600;

function createOptimisticMessage(text: string, conversationId: string): ChatMessage {
  return {
    id: `pending-${crypto.randomUUID()}`,
    conversationId,
    senderId: "",
    messageText: text,
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
    isOwn: true,
    pending: true,
  };
}

function mapRealtimeRow(row: Record<string, unknown>, currentUserId: string): ChatMessage {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    messageText: row.message_text as string,
    isRead: Boolean(row.is_read),
    readAt: (row.read_at as string | null) ?? null,
    createdAt: row.created_at as string,
    isOwn: row.sender_id === currentUserId,
  };
}

function appendOptimisticToDetail(
  prev: ConversationDetail | null,
  participant: MessageParticipant,
  optimisticMessage: ChatMessage,
  conversationId: string | null,
): ConversationDetail {
  const now = optimisticMessage.createdAt;
  const base: ConversationDetail =
    prev ??
    ({
      id: conversationId ?? "",
      createdAt: now,
      participants: [participant],
      otherParticipant: participant,
      messages: [],
      hasMore: false,
      nextCursor: null,
      stats: {
        totalMessages: 0,
        unreadMessages: 0,
        conversationStarted: now,
        lastActiveAt: null,
      },
    } satisfies ConversationDetail);

  return {
    ...base,
    id: conversationId ?? base.id,
    messages: [...base.messages, optimisticMessage],
    stats: {
      ...base.stats,
      totalMessages: base.stats.totalMessages + 1,
      lastActiveAt: now,
    },
  };
}

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
  const [currentUser, setCurrentUser] = useState<MessageParticipant | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const realtimeEnabledRef = useRef(true);
  const currentUserIdRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const listRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  activeConversationIdRef.current = activeConversationId;

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

  const scheduleListRefresh = useCallback(() => {
    if (listRefreshTimerRef.current) {
      clearTimeout(listRefreshTimerRef.current);
    }
    listRefreshTimerRef.current = setTimeout(() => {
      void fetchConversations();
    }, LIST_REFRESH_DEBOUNCE_MS);
  }, [fetchConversations]);

  const fetchConversationDetail = useCallback(
    async (conversationId: string, options?: { silent?: boolean }) => {
      if (!options?.silent) setThreadLoading(true);
      try {
        const res = await fetch(`/api/messages/conversation/${conversationId}`);
        if (!res.ok) return;
        const data = (await res.json()) as ConversationDetail;
        setConversationDetail(data);
        setActiveRepId(data.otherParticipant.id);
      } finally {
        if (!options?.silent) setThreadLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(
    async (conversationId: string, refreshList = false) => {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (refreshList) scheduleListRefresh();
    },
    [scheduleListRefresh],
  );

  const openConversation = useCallback(
    async (conversationId: string, repId?: string) => {
      setActiveConversationId(conversationId);
      if (repId) setActiveRepId(repId);
      await fetchConversationDetail(conversationId);
      void markAsRead(conversationId, true);
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
    (message: string) => {
      if (!activeRepId && !activeConversationId) return;

      const participant =
        conversationDetail?.otherParticipant ??
        conversations.find((entry) => entry.repId === activeRepId)?.otherParticipant;

      if (!participant) return;

      const optimisticId = `pending-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const optimisticMessage: ChatMessage = {
        ...createOptimisticMessage(message, activeConversationId ?? ""),
        id: optimisticId,
        createdAt: now,
      };

      setConversationDetail((prev) =>
        appendOptimisticToDetail(prev, participant, optimisticMessage, activeConversationId),
      );

      setConversations((prev) => {
        const next = prev.map((entry) =>
          entry.repId === activeRepId
            ? {
                ...entry,
                lastMessageText: message,
                lastMessageAt: now,
              }
            : entry,
        );
        const index = next.findIndex((entry) => entry.repId === activeRepId);
        if (index <= 0) return next;
        const [item] = next.splice(index, 1);
        return [item, ...next];
      });

      void (async () => {
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
          setConversationDetail((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.map((item) =>
                item.id === optimisticId
                  ? { ...item, pending: false, failed: true }
                  : item,
              ),
            };
          });
          return;
        }

        const data = await res.json();
        const conversationId = (data.conversationId as string) ?? activeConversationId;
        const confirmed = data.message as ChatMessage;

        if (conversationId) {
          setActiveConversationId(conversationId);
        }

        setConversationDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            id: conversationId ?? prev.id,
            messages: prev.messages.map((item) =>
              item.id === optimisticId ? { ...confirmed, pending: false, failed: false } : item,
            ),
            stats: {
              ...prev.stats,
              lastActiveAt: confirmed.createdAt,
            },
          };
        });

        setConversations((prev) =>
          prev.map((entry) =>
            entry.repId === activeRepId
              ? {
                  ...entry,
                  conversationId: conversationId ?? entry.conversationId,
                  lastMessageText: message,
                  lastMessageAt: confirmed.createdAt,
                }
              : entry,
          ),
        );

        scheduleListRefresh();
      })();
    },
    [
      activeConversationId,
      activeRepId,
      conversationDetail?.otherParticipant,
      conversations,
      scheduleListRefresh,
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
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("users")
        .select("id, full_name, email, phone, image_url, role, updated_at")
        .eq("auth_user_id", data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (!profile) return;
          currentUserIdRef.current = profile.id;
          setCurrentUser(mapProfileToParticipant(profile));
        });
    });
  }, []);

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
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const conversationId = row.conversation_id as string;
          const currentUserId = currentUserIdRef.current ?? "";
          const incoming = mapRealtimeRow(row, currentUserId);

          if (conversationId === activeConversationIdRef.current) {
            setConversationDetail((prev) => {
              if (!prev) return prev;
              if (prev.messages.some((item) => item.id === incoming.id)) return prev;
              const withoutPendingDuplicate = prev.messages.filter(
                (item) =>
                  !(
                    item.pending &&
                    item.isOwn &&
                    item.messageText === incoming.messageText
                  ),
              );
              return {
                ...prev,
                messages: [...withoutPendingDuplicate, incoming],
                stats: {
                  ...prev.stats,
                  totalMessages: withoutPendingDuplicate.length + 1,
                  lastActiveAt: incoming.createdAt,
                },
              };
            });

            if (incoming.senderId !== currentUserId && document.hasFocus()) {
              void markAsRead(conversationId);
            }
          }

          scheduleListRefresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          scheduleListRefresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          scheduleListRefresh();
        },
      )
      .subscribe((status) => {
        realtimeEnabledRef.current = status === "SUBSCRIBED";
      });

    return () => {
      supabase.removeChannel(channel);
      if (listRefreshTimerRef.current) {
        clearTimeout(listRefreshTimerRef.current);
      }
    };
  }, [markAsRead, scheduleListRefresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (realtimeEnabledRef.current) return;
      void fetchConversations();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchConversations]);

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
                otherParticipant={participant!}
                currentUser={currentUser ?? participant!}
                hasMore={conversationDetail?.hasMore ?? false}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
              />
            )}
            <MessageComposer onSend={handleSend} disabled={!activeRepId} />
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
