import { createServiceClient } from "@/lib/supabase/server";
import { getFileSignedUrl } from "@/services/file-storage.service";
import type { StorageBucket } from "@/lib/vehicles/server/utils";
import type { MessageAttachment } from "../types";

export async function loadAttachmentsForMessages(
  messageIds: string[],
): Promise<Map<string, MessageAttachment[]>> {
  const map = new Map<string, MessageAttachment[]>();
  if (messageIds.length === 0) return map;

  const supabase = createServiceClient();

  const { data: rows } = await supabase
    .from("message_attachments")
    .select(
      `
        message_id,
        file:files(id, original_name, mime_type, file_size, bucket, storage_path)
      `,
    )
    .in("message_id", messageIds);

  const { data: sendRows } = await supabase
    .from("document_sends")
    .select("id, message_id")
    .in("message_id", messageIds);

  const sendIdByMessage = new Map<string, string>();
  for (const send of sendRows ?? []) {
    if (send.message_id) {
      sendIdByMessage.set(send.message_id, send.id);
    }
  }

  for (const row of rows ?? []) {
    const file = row.file as unknown as {
      id: string;
      original_name: string;
      mime_type: string;
      file_size: number;
      bucket: string;
      storage_path: string;
    } | null;

    if (!file) continue;

    const url =
      (await getFileSignedUrl(
        file.storage_path,
        file.bucket as StorageBucket,
        3600,
      )) ?? "";

    const attachment: MessageAttachment = {
      fileId: file.id,
      name: file.original_name,
      mimeType: file.mime_type,
      size: Number(file.file_size ?? 0),
      url,
      sendId: sendIdByMessage.get(row.message_id),
    };

    const existing = map.get(row.message_id) ?? [];
    existing.push(attachment);
    map.set(row.message_id, existing);
  }

  return map;
}
