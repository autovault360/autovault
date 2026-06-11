import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireSalesRepMessagesAccess } from "./auth";
import { findConversationBetweenUsersService } from "./service-ops";
import {
  getUnreadCountForConversation,
  mapUserToParticipant,
} from "./utils";
import type {
  ConversationListItem,
  ConversationsResponse,
  ConversationTab,
} from "../types";

const USER_SELECT = "id, full_name, email, phone, image_url, role, updated_at";

type ConversationMeta = {
  id: string;
  created_at: string;
  last_message_at: string | null;
  last_message_text: string | null;
};

export async function listMessageDirectory(params?: {
  page?: number;
  pageSize?: number;
  tab?: ConversationTab;
  search?: string;
}): Promise<ConversationsResponse> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) {
    return { conversations: [], totalCount: 0, page: 1, pageSize: 25, totalUnread: 0 };
  }

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? 25));
  const tab = params?.tab ?? "all";
  const search = params?.search?.trim().toLowerCase() ?? "";

  const userClient = await createClient();
  const serviceClient = createServiceClient();
  const { user } = auth;

  const { data: reps, error: repsError } = await userClient
    .from("users")
    .select(USER_SELECT)
    .eq("dealership_id", user.dealershipId)
    .eq("role", "sales_rep")
    .eq("is_active", true)
    .neq("id", user.userId)
    .order("full_name", { ascending: true });

  if (repsError || !reps?.length) {
    return { conversations: [], totalCount: 0, page, pageSize, totalUnread: 0 };
  }

  const { data: myParticipations } = await serviceClient
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.userId);

  const conversationIds = (myParticipations ?? []).map((p) => p.conversation_id);
  const conversationByRepId = new Map<string, ConversationMeta>();

  if (conversationIds.length > 0) {
    const { data: conversationRows } = await serviceClient
      .from("conversations")
      .select("id, created_at, last_message_at, last_message_text")
      .eq("dealership_id", user.dealershipId)
      .in("id", conversationIds);

    for (const conv of conversationRows ?? []) {
      const { data: participants } = await serviceClient
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conv.id);

      const otherUserId = (participants ?? [])
        .map((p) => p.user_id)
        .find((id) => id !== user.userId);

      if (otherUserId) {
        conversationByRepId.set(otherUserId, conv);
      }
    }
  }

  const items: ConversationListItem[] = [];

  for (const rep of reps) {
    const participant = await mapUserToParticipant(rep);
    const conv = conversationByRepId.get(rep.id);

    let unreadCount = 0;
    if (conv) {
      unreadCount = await getUnreadCountForConversation(serviceClient, conv.id, user.userId);
    }

    if (tab === "unread" && unreadCount === 0) continue;

    if (search) {
      const haystack = `${participant.fullName} ${participant.email}`.toLowerCase();
      if (!haystack.includes(search)) continue;
    }

    items.push({
      repId: rep.id,
      conversationId: conv?.id ?? null,
      otherParticipant: participant,
      lastMessageText: conv?.last_message_text ?? null,
      lastMessageAt: conv?.last_message_at ?? null,
      unreadCount,
      createdAt: conv?.created_at ?? null,
    });
  }

  items.sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt;
    const bTime = b.lastMessageAt ?? b.createdAt;

    if (aTime && bTime) {
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    }
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;

    return a.otherParticipant.fullName.localeCompare(b.otherParticipant.fullName);
  });

  const totalUnread = items.reduce((sum, item) => sum + item.unreadCount, 0);
  const totalCount = items.length;
  const offset = (page - 1) * pageSize;
  const paginated = items.slice(offset, offset + pageSize);

  return {
    conversations: paginated,
    totalCount,
    page,
    pageSize,
    totalUnread,
  };
}

export async function listConversations(params?: {
  page?: number;
  pageSize?: number;
  tab?: ConversationTab;
  search?: string;
}): Promise<ConversationsResponse> {
  return listMessageDirectory(params);
}

export async function getOrCreateConversation(
  recipientId: string,
): Promise<{ conversationId: string } | { error: string }> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return { error: auth.error };

  if (recipientId === auth.user.userId) {
    return { error: "You cannot message yourself." };
  }

  const userClient = await createClient();

  const { data: recipient } = await userClient
    .from("users")
    .select("id, role, dealership_id, is_active")
    .eq("id", recipientId)
    .maybeSingle();

  if (
    !recipient ||
    recipient.role !== "sales_rep" ||
    recipient.dealership_id !== auth.user.dealershipId ||
    !recipient.is_active
  ) {
    return { error: "Recipient not found." };
  }

  const existingId = await findConversationBetweenUsersService(
    auth.user.dealershipId,
    auth.user.userId,
    recipientId,
  );

  if (existingId) {
    return { conversationId: existingId };
  }

  const serviceClient = createServiceClient();

  const { data: conversation, error: convError } = await serviceClient
    .from("conversations")
    .insert({ dealership_id: auth.user.dealershipId })
    .select("id")
    .single();

  if (convError || !conversation) {
    return { error: convError?.message ?? "Failed to create conversation." };
  }

  const { error: selfParticipantError } = await serviceClient
    .from("conversation_participants")
    .insert({ conversation_id: conversation.id, user_id: auth.user.userId });

  if (selfParticipantError) {
    await serviceClient.from("conversations").delete().eq("id", conversation.id);
    return { error: selfParticipantError.message };
  }

  const { error: recipientParticipantError } = await serviceClient
    .from("conversation_participants")
    .insert({ conversation_id: conversation.id, user_id: recipientId });

  if (recipientParticipantError) {
    await serviceClient.from("conversations").delete().eq("id", conversation.id);
    return { error: recipientParticipantError.message };
  }

  return { conversationId: conversation.id };
}

export async function searchSalesReps(query: string): Promise<
  Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    imageUrl: string | null;
    initials: string;
    existingConversationId: string | null;
  }>
> {
  const result = await listMessageDirectory({
    page: 1,
    pageSize: 50,
    tab: "all",
    search: query,
  });

  return result.conversations.map((entry) => ({
    id: entry.repId,
    fullName: entry.otherParticipant.fullName,
    email: entry.otherParticipant.email,
    phone: entry.otherParticipant.phone,
    imageUrl: entry.otherParticipant.imageUrl,
    initials: entry.otherParticipant.initials,
    existingConversationId: entry.conversationId,
  }));
}

export async function getTotalUnreadCount(): Promise<number> {
  const result = await listMessageDirectory({ page: 1, pageSize: 1000, tab: "all" });
  return result.totalUnread;
}
