import type { SupabaseClient } from "@supabase/supabase-js";

export async function logCpaNoteActivity(
  supabase: SupabaseClient,
  params: {
    noteId: string;
    userId: string;
    activityType: string;
    activityDescription: string;
  },
): Promise<void> {
  const { error } = await supabase.from("cpa_note_activity").insert({
    note_id: params.noteId,
    user_id: params.userId,
    activity_type: params.activityType,
    activity_description: params.activityDescription,
  });
  if (error) throw new Error(error.message);
}
