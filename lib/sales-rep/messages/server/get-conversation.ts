import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireSalesRepMessagesAccess } from "./auth";
import { assertConversationParticipant } from "./service-ops";
import { getUnreadCountForConversation, mapUserToParticipant } from "./utils";
import { loadAttachmentsForMessages } from "./load-attachments";
import type { ChatMessage, ConversationDetail } from "../types";

const USER_SELECT = "id, full_name, email, phone, image_url, role, updated_at";

export async function getConversationDetail(
  conversationId: string,
  params?: { cursor?: string; limit?: number },
): Promise<ConversationDetail | { error: string }> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return { error: auth.error };

  const participantCheck = await assertConversationParticipant(auth.user, conversationId);
  if (!participantCheck.ok) {
    return { error: participantCheck.error };
  }

  const limit = Math.min(100, Math.max(1, params?.limit ?? 50));
  const supabase = createServiceClient();
  const userClient = await createClient();
  const { user } = auth;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, created_at, dealership_id")
    .eq("id", conversationId)
    .eq("dealership_id", user.dealershipId)
    .maybeSingle();

  if (convError || !conversation) {
    return { error: "Conversation not found." };
  }

  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);

  const participantIds = (participantRows ?? []).map((p) => p.user_id);

  const { data: userRows } = await userClient
    .from("users")
    .select(USER_SELECT)
    .in("id", participantIds);

  const participants = await Promise.all(
    (userRows ?? []).map((row) => mapUserToParticipant(row)),
  );

  const otherParticipant =
    participants.find((p) => p.id !== user.userId) ?? participants[0];

  let messageQuery = supabase
    .from("messages")
    .select("id, conversation_id, sender_id, message_text, is_read, read_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (params?.cursor) {
    messageQuery = messageQuery.lt("created_at", params.cursor);
  }

  const { data: messageRows, error: msgError } = await messageQuery;

  if (msgError) {
    return { error: msgError.message };
  }

  const hasMore = (messageRows?.length ?? 0) > limit;
  const sliced = (messageRows ?? []).slice(0, limit).reverse();
  const messageIds = sliced.map((row) => row.id);
  const attachmentsMap = await loadAttachmentsForMessages(messageIds);

  const messages: ChatMessage[] = sliced.map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    messageText: row.message_text,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    isOwn: row.sender_id === user.userId,
    attachments: attachmentsMap.get(row.id) ?? [],
  }));

  const nextCursor =
    hasMore && sliced.length > 0 ? sliced[0].created_at : null;

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  const unreadMessages = await getUnreadCountForConversation(
    supabase,
    conversationId,
    user.userId,
  );

  const { data: lastMessage } = await supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    id: conversation.id,
    createdAt: conversation.created_at,
    participants,
    otherParticipant,
    messages,
    hasMore,
    nextCursor,
    stats: {
      totalMessages: totalMessages ?? 0,
      unreadMessages,
      conversationStarted: conversation.created_at,
      lastActiveAt: lastMessage?.created_at ?? null,
    },
  };
}

export async function loadOlderMessages(
  conversationId: string,
  cursor: string,
  limit = 50,
): Promise<{ messages: ChatMessage[]; hasMore: boolean; nextCursor: string | null } | { error: string }> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return { error: auth.error };

  const participantCheck = await assertConversationParticipant(auth.user, conversationId);
  if (!participantCheck.ok) {
    return { error: participantCheck.error };
  }

  const supabase = createServiceClient();

  const { data: messageRows, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, message_text, is_read, read_at, created_at")
    .eq("conversation_id", conversationId)
    .lt("created_at", cursor)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error) return { error: error.message };

  const hasMore = (messageRows?.length ?? 0) > limit;
  const sliced = (messageRows ?? []).slice(0, limit).reverse();
  const messageIds = sliced.map((row) => row.id);
  const attachmentsMap = await loadAttachmentsForMessages(messageIds);

  const messages: ChatMessage[] = sliced.map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    messageText: row.message_text,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    isOwn: row.sender_id === auth.user.userId,
    attachments: attachmentsMap.get(row.id) ?? [],
  }));

  return {
    messages,
    hasMore,
    nextCursor: hasMore && sliced.length > 0 ? sliced[0].created_at : null,
  };
}
