import { createClient, createServiceClient } from "@/lib/supabase/server";
import { documentSendEmail } from "@/lib/email/email-template";
import { getOrCreateConversation } from "@/lib/sales-rep/messages/server/list-conversations";
import { sendTransactionalEmail } from "@/services/brevo.service";
import { uploadAndTrackFile, downloadFileBuffer, verifyStorageObjectExists } from "@/services/file-storage.service";
import { requireSendDocumentAccess } from "./auth";

type SendInput = {
  recipientType: "email" | "sales_rep";
  emailAddresses?: string;
  salesRepId?: string;
  message?: string;
  fileIds?: string[];
  uploads?: File[];
};

type FileRecord = {
  id: string;
  original_name: string;
  bucket: string;
  storage_path: string;
  mime_type: string;
};

async function resolveFileRecords(
  dealershipId: string,
  fileIds: string[],
): Promise<FileRecord[] | { error: string }> {
  if (fileIds.length === 0) {
    return { error: "Select at least one document." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("id, original_name, bucket, storage_path, mime_type")
    .eq("dealership_id", dealershipId)
    .in("id", fileIds)
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length !== fileIds.length) {
    return { error: "One or more selected documents could not be found." };
  }

  return data;
}

async function uploadPendingFiles(
  dealershipId: string,
  userId: string,
  uploads: File[],
): Promise<string[] | { error: string }> {
  const ids: string[] = [];

  for (const file of uploads) {
    const result = await uploadAndTrackFile(
      file,
      "vehicle-documents",
      dealershipId,
      userId,
      { sourceEntity: "document_center", sourceEntityId: dealershipId },
    );

    if (!result.fileId) {
      return { error: `Failed to upload ${file.name}.` };
    }

    ids.push(result.fileId);
  }

  return ids;
}

async function downloadFileBase64(
  bucket: string,
  storagePath: string,
  originalName: string,
): Promise<{ content: string } | { error: string }> {
  const result = await downloadFileBuffer(bucket, storagePath);
  if ("error" in result) {
    return { error: `Failed to read ${originalName} for email attachment. ${result.error}` };
  }
  return { content: result.data.toString("base64") };
}

async function insertSendRecord(params: {
  dealershipId: string;
  senderId: string;
  recipientType: "email" | "sales_rep";
  recipientEmail?: string;
  recipientUserId?: string;
  messageText: string;
  deliveryMethod: "email" | "internal_message";
  conversationId?: string;
  messageId?: string;
  emailMessageId?: string;
  fileIds: string[];
}): Promise<string | { error: string }> {
  const supabase = createServiceClient();

  const { data: sendRow, error: sendError } = await supabase
    .from("document_sends")
    .insert({
      dealership_id: params.dealershipId,
      sender_id: params.senderId,
      recipient_type: params.recipientType,
      recipient_email: params.recipientEmail ?? null,
      recipient_user_id: params.recipientUserId ?? null,
      message_text: params.messageText,
      delivery_method: params.deliveryMethod,
      conversation_id: params.conversationId ?? null,
      message_id: params.messageId ?? null,
      email_message_id: params.emailMessageId ?? null,
    })
    .select("id")
    .single();

  if (sendError || !sendRow) {
    return { error: sendError?.message ?? "Failed to log send history." };
  }

  const { error: filesError } = await supabase.from("document_send_files").insert(
    params.fileIds.map((fileId) => ({
      send_id: sendRow.id,
      file_id: fileId,
    })),
  );

  if (filesError) {
    return { error: filesError.message };
  }

  return sendRow.id;
}

export async function sendDocuments(
  input: SendInput,
): Promise<{ sendId: string; conversationId?: string } | { error: string }> {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return { error: auth.error };

  const messageText = input.message?.trim() ?? "";
  const uploads = input.uploads ?? [];
  const existingIds = input.fileIds ?? [];

  let allFileIds = [...existingIds];

  if (uploads.length > 0) {
    const uploaded = await uploadPendingFiles(
      auth.user.dealershipId,
      auth.user.userId,
      uploads,
    );
    if ("error" in uploaded) return uploaded;
    allFileIds = [...allFileIds, ...uploaded];
  }

  const files = await resolveFileRecords(auth.user.dealershipId, allFileIds);
  if ("error" in files) return files;

  const supabaseUser = await createClient();
  const { data: senderProfile } = await supabaseUser
    .from("users")
    .select("full_name")
    .eq("id", auth.user.userId)
    .maybeSingle();

  const senderName = senderProfile?.full_name ?? "AutoVault360 User";
  const documentNames = files.map((f) => f.original_name);
  const fallbackMessage =
    messageText || `Shared ${files.length} document${files.length === 1 ? "" : "s"}.`;

  if (input.recipientType === "email") {
    const rawEmails = input.emailAddresses?.trim();
    if (!rawEmails) {
      return { error: "Email address is required." };
    }

    for (const file of files) {
      const exists = await verifyStorageObjectExists(file.bucket, file.storage_path);
      if (!exists) {
        return {
          error: `Cannot send ${file.original_name}: the file is missing from storage. Upload it again or choose a different document.`,
        };
      }
    }

    const emails = rawEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const attachments = [];
    for (const file of files) {
      const downloaded = await downloadFileBase64(
        file.bucket,
        file.storage_path,
        file.original_name,
      );
      if ("error" in downloaded) {
        return { error: downloaded.error };
      }
      attachments.push({ name: file.original_name, content: downloaded.content });
    }

    const emailResult = await sendTransactionalEmail({
      to: emails.map((email) => ({ email })),
      subject: `Documents from ${senderName} - AutoVault360`,
      htmlContent: documentSendEmail({
        senderName,
        message: fallbackMessage,
        documentCount: files.length,
        documentNames,
      }),
      attachment: attachments,
    });

    if (!emailResult.success) {
      return { error: emailResult.error };
    }

    const sendId = await insertSendRecord({
      dealershipId: auth.user.dealershipId,
      senderId: auth.user.userId,
      recipientType: "email",
      recipientEmail: emails.join(", "),
      messageText: fallbackMessage,
      deliveryMethod: "email",
      emailMessageId: emailResult.messageId,
      fileIds: allFileIds,
    });

    if (typeof sendId === "object") return sendId;
    return { sendId };
  }

  if (!input.salesRepId) {
    return { error: "Please select a sales rep." };
  }

  const conversation = await getOrCreateConversation(input.salesRepId);
  if ("error" in conversation) {
    return { error: conversation.error };
  }

  const serviceClient = createServiceClient();

  const { data: messageRow, error: messageError } = await serviceClient
    .from("messages")
    .insert({
      conversation_id: conversation.conversationId,
      sender_id: auth.user.userId,
      message_text: fallbackMessage,
    })
    .select("id")
    .single();

  if (messageError || !messageRow) {
    return { error: messageError?.message ?? "Failed to send internal message." };
  }

  const { error: attachError } = await serviceClient.from("message_attachments").insert(
    allFileIds.map((fileId) => ({
      message_id: messageRow.id,
      file_id: fileId,
    })),
  );

  if (attachError) {
    return { error: attachError.message };
  }

  const sendId = await insertSendRecord({
    dealershipId: auth.user.dealershipId,
    senderId: auth.user.userId,
    recipientType: "sales_rep",
    recipientUserId: input.salesRepId,
    messageText: fallbackMessage,
    deliveryMethod: "internal_message",
    conversationId: conversation.conversationId,
    messageId: messageRow.id,
    fileIds: allFileIds,
  });

  if (typeof sendId === "object") return sendId;

  return {
    sendId,
    conversationId: conversation.conversationId,
  };
}
