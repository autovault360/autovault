"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapProfileToParticipant } from "@/lib/sales-rep/messages/calculations";
import type { MessageParticipant } from "@/lib/sales-rep/messages/types";
import MessageComposer from "@/components/sales-rep/messages/message-composer";
import TeamChatHeader from "./team-chat-header";
import TeamChatSidebar from "./team-chat-sidebar";
import TeamChatThread from "./team-chat-thread";
import TeamMembersSidebar from "./team-members-sidebar";
import type { TeamChatDetail, TeamChatMessage } from "@/lib/sales-rep/team-chat/types";

const POLL_INTERVAL_MS = 30_000;

function createOptimisticMessage(
  text: string,
  teamChatId: string,
  sender: MessageParticipant,
): TeamChatMessage {
  return {
    id: `pending-${crypto.randomUUID()}`,
    teamChatId,
    senderId: sender.id,
    sender,
    messageText: text,
    createdAt: new Date().toISOString(),
    isOwn: true,
    seenByCount: 0,
    pending: true,
  };
}

function mapRealtimeRow(
  row: Record<string, unknown>,
  currentUserId: string,
  members: Map<string, MessageParticipant>,
  fallbackSender: MessageParticipant,
): TeamChatMessage {
  const senderId = row.sender_id as string;
  const sender = members.get(senderId) ?? fallbackSender;

  return {
    id: row.id as string,
    teamChatId: row.team_chat_id as string,
    senderId,
    sender,
    messageText: row.message_text as string,
    createdAt: row.created_at as string,
    isOwn: senderId === currentUserId,
    seenByCount: 0,
  };
}

export default function TeamChatPage() {
  const [detail, setDetail] = useState<TeamChatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<MessageParticipant | null>(null);

  const currentUserIdRef = useRef<string | null>(null);
  const teamChatIdRef = useRef<string | null>(null);
  const membersMapRef = useRef<Map<string, MessageParticipant>>(new Map());
  const realtimeEnabledRef = useRef(true);

  const fetchTeamChat = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const res = await fetch("/api/team-chat?limit=50");
      if (!res.ok) return;
      const data = (await res.json()) as TeamChatDetail;
      setDetail(data);
      teamChatIdRef.current = data.chat.id;
      membersMapRef.current = new Map(data.members.map((member) => [member.id, member]));
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (teamChatId: string) => {
    await fetch("/api/team-chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamChatId }),
    });

    setDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chat: { ...prev.chat, unreadCount: 0 },
      };
    });
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!detail?.hasMore || !detail.nextCursor || !teamChatIdRef.current) return;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        cursor: detail.nextCursor,
        limit: "50",
      });
      const res = await fetch(`/api/team-chat?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as TeamChatDetail;

      setDetail((prev) => {
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
  }, [detail]);

  const handleSend = useCallback(
    (message: string) => {
      if (!currentUser) return;

      const teamChatId = teamChatIdRef.current ?? detail?.chat.id ?? "";
      const optimisticId = `pending-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const optimisticMessage: TeamChatMessage = {
        ...createOptimisticMessage(message, teamChatId, currentUser),
        id: optimisticId,
        createdAt: now,
      };

      setDetail((prev) => {
        if (!prev) {
          return {
            chat: {
              id: teamChatId,
              name: "Team Chat",
              description: "Group messaging with your entire team.",
              memberCount: 1,
              createdAt: now,
              createdByName: null,
              lastMessageText: message,
              lastMessageAt: now,
              unreadCount: 0,
            },
            members: [currentUser],
            messages: [optimisticMessage],
            hasMore: false,
            nextCursor: null,
          };
        }

        return {
          ...prev,
          chat: {
            ...prev.chat,
            lastMessageText: message,
            lastMessageAt: now,
          },
          messages: [...prev.messages, optimisticMessage],
        };
      });

      void (async () => {
        const res = await fetch("/api/team-chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          toast.error(body?.error ?? "Failed to send message.");
          setDetail((prev) => {
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
        const confirmed = data.message as TeamChatMessage;
        const resolvedTeamChatId = (data.teamChatId as string) ?? teamChatId;
        teamChatIdRef.current = resolvedTeamChatId;

        setDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            chat: {
              ...prev.chat,
              id: resolvedTeamChatId,
              lastMessageText: message,
              lastMessageAt: confirmed.createdAt,
            },
            messages: prev.messages.map((item) =>
              item.id === optimisticId ? { ...confirmed, pending: false, failed: false } : item,
            ),
          };
        });
      })();
    },
    [currentUser, detail?.chat.id],
  );

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
          const participant = mapProfileToParticipant(profile);
          setCurrentUser(participant);
          membersMapRef.current.set(profile.id, participant);
        });
    });
  }, []);

  useEffect(() => {
    void fetchTeamChat().then(() => {
      if (teamChatIdRef.current) {
        void markAsRead(teamChatIdRef.current);
      }
    });
  }, [fetchTeamChat, markAsRead]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("sales-rep-team-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_chat_messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const teamChatId = row.team_chat_id as string;
          const currentUserId = currentUserIdRef.current ?? "";

          if (teamChatId !== teamChatIdRef.current) return;

          const fallbackSender: MessageParticipant = {
            id: row.sender_id as string,
            fullName: "Team Member",
            email: "",
            phone: null,
            imageUrl: null,
            initials: "?",
            role: "Sales Representative",
            isOnline: false,
            lastActiveAt: null,
          };

          const incoming = mapRealtimeRow(
            row,
            currentUserId,
            membersMapRef.current,
            fallbackSender,
          );

          setDetail((prev) => {
            if (!prev) return prev;
            if (prev.messages.some((item) => item.id === incoming.id)) return prev;

            const withoutPendingDuplicate = prev.messages.filter(
              (item) =>
                !(item.pending && item.isOwn && item.messageText === incoming.messageText),
            );

            return {
              ...prev,
              chat: {
                ...prev.chat,
                lastMessageText: incoming.messageText,
                lastMessageAt: incoming.createdAt,
                unreadCount:
                  incoming.senderId !== currentUserId && !document.hasFocus()
                    ? prev.chat.unreadCount + 1
                    : prev.chat.unreadCount,
              },
              messages: [...withoutPendingDuplicate, incoming],
            };
          });

          if (incoming.senderId !== currentUserId && document.hasFocus()) {
            void markAsRead(teamChatId);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "team_chats" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.id !== teamChatIdRef.current) return;

          setDetail((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              chat: {
                ...prev.chat,
                lastMessageText: (row.last_message_text as string | null) ?? prev.chat.lastMessageText,
                lastMessageAt: (row.last_message_at as string | null) ?? prev.chat.lastMessageAt,
              },
            };
          });
        },
      )
      .subscribe((status) => {
        realtimeEnabledRef.current = status === "SUBSCRIBED";
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [markAsRead]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (realtimeEnabledRef.current) return;
      void fetchTeamChat({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchTeamChat]);

  useEffect(() => {
    function handleFocus() {
      if (teamChatIdRef.current) {
        void markAsRead(teamChatIdRef.current);
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [markAsRead]);

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[560px] overflow-hidden rounded-xl border border-slate-800/80 bg-[#010d19]">
      <TeamChatSidebar
        chat={detail?.chat ?? null}
        search={search}
        onSearchChange={setSearch}
        loading={loading && !detail}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {detail ? (
          <>
            <TeamChatHeader chat={detail.chat} />
            {loading && detail.messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-[13px] text-slate-500">
                Loading team chat...
              </div>
            ) : (
              <TeamChatThread
                messages={detail.messages}
                hasMore={detail.hasMore}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
                searchQuery={search}
              />
            )}
            <MessageComposer onSend={handleSend} disabled={!currentUser} />
          </>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-slate-500">
            Loading team chat...
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[13px] text-slate-500">
            Unable to load team chat.
          </div>
        )}
      </div>

      {detail ? (
        <TeamMembersSidebar chat={detail.chat} members={detail.members} />
      ) : (
        <div className="hidden w-[300px] shrink-0 border-l border-slate-800/80 bg-[#0a1524] xl:block" />
      )}
    </div>
  );
}
