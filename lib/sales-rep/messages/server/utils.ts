import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { getInitials } from "../calculations";
import type { MessageParticipant } from "../types";

type RawUserRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  image_url: string | null;
  role: string | null;
  updated_at?: string | null;
};

export async function mapUserToParticipant(
  row: RawUserRow,
): Promise<MessageParticipant> {
  let imageUrl: string | null = null;
  if (row.image_url) {
    try {
      imageUrl = await getSignedUrl("user-images", row.image_url, 3600);
    } catch {
      imageUrl = null;
    }
  }

  const fullName = row.full_name?.trim() || row.email;

  return {
    id: row.id,
    fullName,
    email: row.email,
    phone: row.phone,
    imageUrl,
    initials: getInitials(fullName),
    role: "Sales Representative",
    isOnline: false,
    lastActiveAt: row.updated_at ?? null,
  };
}

export async function findConversationBetweenUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  userIdA: string,
  userIdB: string,
): Promise<string | null> {
  const { data: participationsA } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userIdA);

  const conversationIds = (participationsA ?? []).map((row) => row.conversation_id);
  if (conversationIds.length === 0) return null;

  for (const conversationId of conversationIds) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, dealership_id")
      .eq("id", conversationId)
      .eq("dealership_id", dealershipId)
      .maybeSingle();

    if (!conversation) continue;

    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId);

    const userIds = (participants ?? []).map((p) => p.user_id).sort();
    const target = [userIdA, userIdB].sort();
    if (userIds.length === 2 && userIds[0] === target[0] && userIds[1] === target[1]) {
      return conversationId;
    }
  }

  return null;
}

export async function getUnreadCountForConversation(
  supabase: SupabaseClient,
  conversationId: string,
  currentUserId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", currentUserId);

  if (error) return 0;
  return count ?? 0;
}

export async function getOtherParticipantId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  currentUserId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", currentUserId)
    .maybeSingle();

  return data?.user_id ?? null;
}
