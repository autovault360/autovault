import { createServiceClient } from "@/lib/supabase/server";
import { mapUserToParticipant } from "@/lib/sales-rep/messages/server/utils";
import { requireTeamChatAccess } from "./auth";
import type { TeamChatMessage } from "../types";

async function ensureTeamChat(dealershipId: string, userId: string) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("team_chats")
    .select("id")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("team_chats")
    .insert({ dealership_id: dealershipId, created_by: userId })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create team chat.");
  }

  return created.id;
}

export async function sendTeamMessage(
  message: string,
): Promise<{ message: TeamChatMessage; teamChatId: string } | { error: string }> {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return { error: auth.error };

  const text = message.trim();
  if (!text) return { error: "Message cannot be empty." };

  let teamChatId: string;
  try {
    teamChatId = await ensureTeamChat(auth.user.dealershipId, auth.user.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load team chat." };
  }

  const supabase = createServiceClient();

  const { data: row, error } = await supabase
    .from("team_chat_messages")
    .insert({
      team_chat_id: teamChatId,
      sender_id: auth.user.userId,
      message_text: text,
    })
    .select("id, team_chat_id, sender_id, message_text, created_at")
    .single();

  if (error || !row) {
    return { error: error?.message ?? "Failed to send message." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, email, phone, image_url, role, updated_at")
    .eq("id", auth.user.userId)
    .maybeSingle();

  const sender = await mapUserToParticipant(
    profile ?? {
      id: auth.user.userId,
      full_name: "You",
      email: "",
      phone: null,
      image_url: null,
      role: "sales_rep",
    },
  );

  return {
    teamChatId,
    message: {
      id: row.id,
      teamChatId: row.team_chat_id,
      senderId: row.sender_id,
      sender,
      messageText: row.message_text,
      createdAt: row.created_at,
      isOwn: true,
      seenByCount: 0,
    },
  };
}
