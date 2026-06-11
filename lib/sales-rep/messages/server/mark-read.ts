import { createServiceClient } from "@/lib/supabase/server";
import { requireSalesRepMessagesAccess } from "./auth";
import { assertConversationParticipant } from "./service-ops";

export async function markConversationRead(
  conversationId: string,
): Promise<{ success: true; updatedCount: number } | { error: string }> {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return { error: auth.error };

  const participantCheck = await assertConversationParticipant(auth.user, conversationId);
  if (!participantCheck.ok) {
    return { error: participantCheck.error };
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: updatedRows, error } = await supabase
    .from("messages")
    .update({ is_read: true, read_at: now })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", auth.user.userId)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  return { success: true, updatedCount: updatedRows?.length ?? 0 };
}
