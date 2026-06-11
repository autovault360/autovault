import { createServiceClient } from "@/lib/supabase/server";
import type { SalesRepMessagesAuth } from "./auth";

export async function assertConversationParticipant(
  auth: SalesRepMessagesAuth,
  conversationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, dealership_id")
    .eq("id", conversationId)
    .eq("dealership_id", auth.dealershipId)
    .maybeSingle();

  if (!conversation) {
    return { ok: false, error: "Conversation not found." };
  }

  const { data: participation } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (!participation) {
    return { ok: false, error: "You are not a participant in this conversation." };
  }

  return { ok: true };
}

export async function findConversationBetweenUsersService(
  dealershipId: string,
  userIdA: string,
  userIdB: string,
): Promise<string | null> {
  const supabase = createServiceClient();

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
