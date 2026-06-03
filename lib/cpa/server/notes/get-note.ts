import { createClient } from "@/lib/supabase/server";
import type {
  CpaNoteActivity,
  CpaNoteAttachment,
  CpaNoteComment,
  CpaNoteDetail,
} from "../../types";
import { mapNoteDetail } from "./mappers";

export async function getCpaNote(
  dealershipId: string,
  noteId: string,
): Promise<CpaNoteDetail | null> {
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("cpa_notes")
    .select(
      `
      id, title, description, category, priority, status,
      stock_number, created_at, updated_at, created_by, assigned_to,
      resolved_at, is_archived,
      users:created_by ( full_name, email ),
      assignee:assigned_to ( full_name )
    `,
    )
    .eq("id", noteId)
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!note) return null;

  const { data: comments } = await supabase
    .from("cpa_note_comments")
    .select(
      `
      id, note_id, user_id, comment, created_at,
      users:user_id ( full_name, email, role )
    `,
    )
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  const { data: attachments } = await supabase
    .from("cpa_note_attachments")
    .select(
      `
      id, note_id, file_name, file_url, file_size, mime_type, created_at,
      users:uploaded_by ( full_name, email )
    `,
    )
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("cpa_note_activity")
    .select(
      `
      id, activity_type, activity_description, created_at,
      users:user_id ( full_name, email )
    `,
    )
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  const mappedComments: CpaNoteComment[] = (comments ?? []).map((c) => {
    const u = Array.isArray(c.users) ? c.users[0] : c.users;
    return {
      id: c.id,
      noteId: c.note_id,
      userId: c.user_id,
      userName: u?.full_name || u?.email || "User",
      userRole: u?.role ?? "",
      comment: c.comment,
      createdAt: c.created_at,
    };
  });

  const mappedAttachments: CpaNoteAttachment[] = await Promise.all(
    (attachments ?? []).map(async (a) => {
      const u = Array.isArray(a.users) ? a.users[0] : a.users;
      let fileUrl = a.file_url;
      if (fileUrl && !fileUrl.startsWith("http")) {
        const { data: signed } = await supabase.storage
          .from("cpa-note-attachments")
          .createSignedUrl(fileUrl, 3600);
        if (signed?.signedUrl) fileUrl = signed.signedUrl;
      }
      return {
        id: a.id,
        noteId: a.note_id,
        fileName: a.file_name,
        fileUrl,
        fileSize: Number(a.file_size),
        mimeType: a.mime_type,
        uploadedByName: u?.full_name || u?.email || "User",
        createdAt: a.created_at,
      };
    }),
  );

  const mappedActivity: CpaNoteActivity[] = (activity ?? []).map((a) => {
    const u = Array.isArray(a.users) ? a.users[0] : a.users;
    return {
      id: a.id,
      activityType: a.activity_type,
      activityDescription: a.activity_description,
      userName: u?.full_name || u?.email || "User",
      createdAt: a.created_at,
    };
  });

  const users = Array.isArray(note.users) ? note.users[0] : note.users;
  const assignee = Array.isArray(note.assignee)
    ? note.assignee[0]
    : note.assignee;

  return mapNoteDetail(
    { ...note, users, assignee },
    mappedComments,
    mappedAttachments,
    mappedActivity,
  );
}
