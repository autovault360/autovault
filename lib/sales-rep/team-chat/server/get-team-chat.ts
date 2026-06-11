import { createClient, createServiceClient } from "@/lib/supabase/server";
import { mapUserToParticipant } from "@/lib/sales-rep/messages/server/utils";
import { requireTeamChatAccess } from "./auth";
import type { TeamChatDetail, TeamChatInfo, TeamChatMember, TeamChatMessage } from "../types";

const USER_SELECT = "id, full_name, email, phone, image_url, role, updated_at";

async function loadMembers(dealershipId: string): Promise<TeamChatMember[]> {
  const supabase = createServiceClient();
  const { data: reps } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("dealership_id", dealershipId)
    .eq("role", "sales_rep")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  return Promise.all((reps ?? []).map((row) => mapUserToParticipant(row)));
}

async function ensureTeamChat(
  dealershipId: string,
  userId: string,
): Promise<{ id: string; created_at: string; created_by: string | null; description: string; name: string; last_message_at: string | null; last_message_text: string | null }> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("team_chats")
    .select("id, name, description, created_at, created_by, last_message_at, last_message_text")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("team_chats")
    .insert({
      dealership_id: dealershipId,
      created_by: userId,
    })
    .select("id, name, description, created_at, created_by, last_message_at, last_message_text")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create team chat.");
  }

  return created;
}

async function getUnreadCount(
  teamChatId: string,
  userId: string,
  lastReadAt: string | null,
): Promise<number> {
  const supabase = createServiceClient();
  let query = supabase
    .from("team_chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("team_chat_id", teamChatId)
    .neq("sender_id", userId);

  if (lastReadAt) {
    query = query.gt("created_at", lastReadAt);
  }

  const { count } = await query;
  return count ?? 0;
}

async function getSeenByCount(
  teamChatId: string,
  messageCreatedAt: string,
  senderId: string,
): Promise<number> {
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("team_chat_member_reads")
    .select("user_id", { count: "exact", head: true })
    .eq("team_chat_id", teamChatId)
    .neq("user_id", senderId)
    .gte("last_read_at", messageCreatedAt);

  return count ?? 0;
}

export async function getTeamChatDetail(params?: {
  cursor?: string;
  limit?: number;
}): Promise<TeamChatDetail | { error: string }> {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return { error: auth.error };

  const limit = Math.min(100, Math.max(1, params?.limit ?? 50));
  const supabase = createServiceClient();
  const userClient = await createClient();

  let chatRow;
  try {
    chatRow = await ensureTeamChat(auth.user.dealershipId, auth.user.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load team chat." };
  }

  const members = await loadMembers(auth.user.dealershipId);
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const { data: readRow } = await supabase
    .from("team_chat_member_reads")
    .select("last_read_at")
    .eq("team_chat_id", chatRow.id)
    .eq("user_id", auth.user.userId)
    .maybeSingle();

  const unreadCount = await getUnreadCount(
    chatRow.id,
    auth.user.userId,
    readRow?.last_read_at ?? null,
  );

  let creatorName: string | null = null;
  if (chatRow.created_by) {
    const { data: creator } = await userClient
      .from("users")
      .select("full_name, email")
      .eq("id", chatRow.created_by)
      .maybeSingle();
    creatorName = creator?.full_name ?? creator?.email ?? null;
  }

  const chat: TeamChatInfo = {
    id: chatRow.id,
    name: chatRow.name,
    description: chatRow.description,
    memberCount: members.length,
    createdAt: chatRow.created_at,
    createdByName: creatorName,
    lastMessageText: chatRow.last_message_text,
    lastMessageAt: chatRow.last_message_at,
    unreadCount,
  };

  let messageQuery = supabase
    .from("team_chat_messages")
    .select("id, team_chat_id, sender_id, message_text, created_at")
    .eq("team_chat_id", chatRow.id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (params?.cursor) {
    messageQuery = messageQuery.lt("created_at", params.cursor);
  }

  const { data: rows, error: msgError } = await messageQuery;
  if (msgError) return { error: msgError.message };

  const hasMore = (rows?.length ?? 0) > limit;
  const sliced = (rows ?? []).slice(0, limit).reverse();

  const messages: TeamChatMessage[] = await Promise.all(
    sliced.map(async (row) => {
      const sender =
        memberMap.get(row.sender_id) ??
        (await mapUserToParticipant({
          id: row.sender_id,
          full_name: "Unknown",
          email: "",
          phone: null,
          image_url: null,
          role: "sales_rep",
        }));

      const seenByCount =
        row.sender_id === auth.user.userId
          ? await getSeenByCount(chatRow.id, row.created_at, row.sender_id)
          : 0;

      return {
        id: row.id,
        teamChatId: row.team_chat_id,
        senderId: row.sender_id,
        sender,
        messageText: row.message_text,
        createdAt: row.created_at,
        isOwn: row.sender_id === auth.user.userId,
        seenByCount,
      };
    }),
  );

  return {
    chat,
    members,
    messages,
    hasMore,
    nextCursor: hasMore && sliced.length > 0 ? sliced[0].created_at : null,
  };
}

export async function getTeamChatUnreadCount(): Promise<number> {
  const result = await getTeamChatDetail({ limit: 1 });
  if ("error" in result) return 0;
  return result.chat.unreadCount;
}
