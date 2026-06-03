import { createClient } from "@/lib/supabase/server";
import type { CpaNoteAttachment } from "../../types";
import { logCpaNoteActivity } from "./activity";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE = 20 * 1024 * 1024;

export async function uploadCpaNoteAttachment(
  dealershipId: string,
  userId: string,
  noteId: string,
  file: File,
): Promise<CpaNoteAttachment> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("File type not allowed.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 20MB limit.");
  }

  const supabase = await createClient();

  const { data: note } = await supabase
    .from("cpa_notes")
    .select("id")
    .eq("id", noteId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!note) throw new Error("Note not found");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${dealershipId}/${noteId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("cpa-note-attachments")
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "3600" });

  if (uploadError) throw new Error(uploadError.message);

  const { data: signed, error: signError } = await supabase.storage
    .from("cpa-note-attachments")
    .createSignedUrl(path, 3600);

  if (signError) throw new Error(signError.message);

  const { data, error } = await supabase
    .from("cpa_note_attachments")
    .insert({
      note_id: noteId,
      uploaded_by: userId,
      file_name: file.name,
      file_url: path,
      file_size: file.size,
      mime_type: file.type,
    })
    .select(
      `
      id, note_id, file_name, file_url, file_size, mime_type, created_at,
      users:uploaded_by ( full_name, email )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  await logCpaNoteActivity(supabase, {
    noteId,
    userId,
    activityType: "Attachment Uploaded",
    activityDescription: `Uploaded ${file.name}`,
  });

  const u = Array.isArray(data.users) ? data.users[0] : data.users;
  return {
    id: data.id,
    noteId: data.note_id,
    fileName: data.file_name,
    fileUrl: signed.signedUrl,
    fileSize: Number(data.file_size),
    mimeType: data.mime_type,
    uploadedByName: u?.full_name || u?.email || "User",
    createdAt: data.created_at,
  };
}
