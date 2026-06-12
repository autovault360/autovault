import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireSendDocumentAccess } from "./auth";
import type { SendHistoryItem, SendHistoryResponse } from "./types";

function deriveReadStatus(item: {
  recipient_type: string;
  read_at: string | null;
  message_is_read?: boolean | null;
}): SendHistoryItem["readStatus"] {
  if (item.recipient_type === "email") return "n/a";
  if (item.read_at || item.message_is_read) return "read";
  return "unread";
}

function deriveDownloadStatus(item: {
  recipient_type: string;
  downloaded_at: string | null;
}): SendHistoryItem["downloadStatus"] {
  if (item.recipient_type === "email") return "n/a";
  if (item.downloaded_at) return "downloaded";
  return "pending";
}

export async function listSendHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<SendHistoryResponse | { error: string }> {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return { error: auth.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  const { data: rows, error, count } = await supabase
    .from("document_sends")
    .select(
      "id, recipient_type, recipient_email, recipient_user_id, sent_at, delivery_method, conversation_id, message_id, read_at, downloaded_at, sender_id",
      { count: "exact" },
    )
    .eq("dealership_id", auth.user.dealershipId)
    .order("sent_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return { error: error.message };
  }

  const sendRows = rows ?? [];
  const senderIds = [...new Set(sendRows.map((row) => row.sender_id))];
  const recipientIds = [
    ...new Set(sendRows.map((row) => row.recipient_user_id).filter(Boolean)),
  ] as string[];
  const sendIds = sendRows.map((row) => row.id);
  const messageIds = sendRows.map((row) => row.message_id).filter(Boolean) as string[];

  const serviceClient = createServiceClient();

  const [usersResult, sendFilesResult, messagesResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name")
      .in("id", [...senderIds, ...recipientIds]),
    supabase
      .from("document_send_files")
      .select("send_id, file:files(original_name)")
      .in("send_id", sendIds.length > 0 ? sendIds : ["00000000-0000-0000-0000-000000000000"]),
    messageIds.length > 0
      ? serviceClient
          .from("messages")
          .select("id, is_read")
          .in("id", messageIds)
      : Promise.resolve({ data: [] as Array<{ id: string; is_read: boolean }> }),
  ]);

  const userNameById = new Map<string, string>();
  for (const user of usersResult.data ?? []) {
    userNameById.set(user.id, user.full_name ?? "Unknown");
  }

  const filesBySendId = new Map<string, string[]>();
  for (const row of sendFilesResult.data ?? []) {
    const file = row.file as unknown as { original_name: string } | null;
    if (!file) continue;
    const existing = filesBySendId.get(row.send_id) ?? [];
    existing.push(file.original_name);
    filesBySendId.set(row.send_id, existing);
  }

  const messageReadById = new Map<string, boolean>();
  for (const message of messagesResult.data ?? []) {
    messageReadById.set(message.id, message.is_read);
  }

  const items: SendHistoryItem[] = sendRows.map((row) => {
    const documentNames = filesBySendId.get(row.id) ?? [];
    const recipientLabel =
      row.recipient_type === "email"
        ? (row.recipient_email ?? "Email recipient")
        : (userNameById.get(row.recipient_user_id ?? "") ?? "Sales rep");

    return {
      id: row.id,
      senderName: userNameById.get(row.sender_id) ?? "Unknown",
      recipientLabel,
      recipientType: row.recipient_type as "email" | "sales_rep",
      documentCount: documentNames.length,
      documentNames,
      sentAt: row.sent_at,
      deliveryMethod: row.delivery_method as "email" | "internal_message",
      readStatus: deriveReadStatus({
        recipient_type: row.recipient_type,
        read_at: row.read_at,
        message_is_read: row.message_id
          ? messageReadById.get(row.message_id)
          : null,
      }),
      downloadStatus: deriveDownloadStatus({
        recipient_type: row.recipient_type,
        downloaded_at: row.downloaded_at,
      }),
      conversationId: row.conversation_id,
      messageId: row.message_id,
    };
  });

  return {
    items,
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function syncSendReadStatusFromMessage(messageId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data: message } = await supabase
    .from("messages")
    .select("is_read, read_at")
    .eq("id", messageId)
    .maybeSingle();

  if (!message?.is_read) return;

  await supabase
    .from("document_sends")
    .update({ read_at: message.read_at ?? new Date().toISOString() })
    .eq("message_id", messageId)
    .is("read_at", null);
}

export async function markSendFileDownloaded(
  sendId: string,
  fileId: string,
): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  await supabase
    .from("document_send_files")
    .update({ downloaded_at: now })
    .eq("send_id", sendId)
    .eq("file_id", fileId)
    .is("downloaded_at", null);

  await supabase
    .from("document_sends")
    .update({ downloaded_at: now })
    .eq("id", sendId)
    .is("downloaded_at", null);
}
