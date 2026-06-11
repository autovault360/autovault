import { createServiceClient } from "@/lib/supabase/server";
import { requireTeamChatAccess } from "./auth";

export async function markTeamChatRead(
  teamChatId: string,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return { error: auth.error };

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: chat } = await supabase
    .from("team_chats")
    .select("id")
    .eq("id", teamChatId)
    .eq("dealership_id", auth.user.dealershipId)
    .maybeSingle();

  if (!chat) return { error: "Team chat not found." };

  const { error } = await supabase.from("team_chat_member_reads").upsert(
    {
      team_chat_id: teamChatId,
      user_id: auth.user.userId,
      last_read_at: now,
    },
    { onConflict: "team_chat_id,user_id" },
  );

  if (error) return { error: error.message };
  return { success: true };
}
