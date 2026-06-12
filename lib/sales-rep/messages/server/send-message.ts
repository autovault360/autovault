import { createServiceClient } from "@/lib/supabase/server";
import { requireSalesRepMessagesAccess } from "./auth";
import { getOrCreateConversation } from "./list-conversations";
import { loadAttachmentsForMessages } from "./load-attachments";
import { assertConversationParticipant } from "./service-ops";
import type { ChatMessage } from "../types";

export async function sendMessage(input: {
  conversationId?: string;
  recipientId?: string;
  message: string;
  fileIds?: string[];
}): Promise<{ message: ChatMessage; conversationId: string } | { error: string }> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return { error: auth.error };

  const text = input.message.trim();
  const fileIds = input.fileIds ?? [];

  if (!text && fileIds.length === 0) {
    return { error: "Message cannot be empty." };
  }

  let conversationId = input.conversationId;

  if (!conversationId && input.recipientId) {
    const created = await getOrCreateConversation(input.recipientId);
    if ("error" in created) return { error: created.error };
    conversationId = created.conversationId;
  }

  if (!conversationId) {
    return { error: "Conversation ID or recipient ID is required." };
  }

  const participantCheck = await assertConversationParticipant(auth.user, conversationId);
  if (!participantCheck.ok) {
    return { error: participantCheck.error };
  }

  const supabase = createServiceClient();
  const messageText =
    text || `Shared ${fileIds.length} document${fileIds.length === 1 ? "" : "s"}.`;

  const { data: row, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: auth.user.userId,
      message_text: messageText,
    })
    .select("id, conversation_id, sender_id, message_text, is_read, read_at, created_at")
    .single();

  if (error || !row) {
    console.error("Failed to send message:", error?.message);
    return { error: error?.message ?? "Failed to send message." };
  }

  if (fileIds.length > 0) {
    const { error: attachError } = await supabase.from("message_attachments").insert(
      fileIds.map((fileId) => ({
        message_id: row.id,
        file_id: fileId,
      })),
    );

    if (attachError) {
      return { error: attachError.message };
    }
  }

  const attachmentsMap = await loadAttachmentsForMessages([row.id]);

  return {
    conversationId,
    message: {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      messageText: row.message_text,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
      isOwn: true,
      attachments: attachmentsMap.get(row.id) ?? [],
    },
  };
}
