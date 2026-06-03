import { createClient } from "@/lib/supabase/server";
import type { CreateCpaCommentInput } from "../../actions/schemas";
import type { CpaNoteComment } from "../../types";
import { logCpaNoteActivity } from "./activity";

export async function addCpaNoteComment(
  dealershipId: string,
  userId: string,
  noteId: string,
  input: CreateCpaCommentInput,
): Promise<CpaNoteComment> {
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("cpa_notes")
    .select("id")
    .eq("id", noteId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!note) throw new Error("Note not found");

  const { data, error } = await supabase
    .from("cpa_note_comments")
    .insert({
      note_id: noteId,
      user_id: userId,
      comment: input.comment,
    })
    .select(
      `
      id, note_id, user_id, comment, created_at,
      users:user_id ( full_name, email, role )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  await logCpaNoteActivity(supabase, {
    noteId,
    userId,
    activityType: "Comment Added",
    activityDescription: "New comment added",
  });

  const u = Array.isArray(data.users) ? data.users[0] : data.users;
  return {
    id: data.id,
    noteId: data.note_id,
    userId: data.user_id,
    userName: u?.full_name || u?.email || "User",
    userRole: u?.role ?? "",
    comment: data.comment,
    createdAt: data.created_at,
  };
}
