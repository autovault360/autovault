"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadFile, trackFile, getSignedUrl } from "@/lib/vehicles/server/utils";
import { authenticateWholesaleDealer } from "@/lib/dealer/inventory/server/utils";
import {
  buildWholesaleDocumentStoragePath,
  WHOLESALE_DOCUMENT_BUCKET,
} from "../constants";
import { createWholesaleDocumentSchema } from "../schemas";

export type DocumentActionResult =
  | { success: true; documentId?: string }
  | { success: false; error: string };

export async function revalidateWholesaleDocumentsPaths() {
  revalidatePath("/dealer/documents");
  revalidatePath("/dealer/dashboard");
}

export async function createWholesaleDocument(
  formData: FormData,
): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please upload a document file." };
  }

  const parsed = createWholesaleDocumentSchema.safeParse({
    documentType: formData.get("documentType"),
    vehicleId: formData.get("vehicleId") || undefined,
    vin: formData.get("vin") || undefined,
    stockNo: formData.get("stockNo") || undefined,
    category: formData.get("category"),
    documentName: formData.get("documentName"),
    description: formData.get("description") || undefined,
    expiryDate: formData.get("expiryDate") || undefined,
    status: formData.get("status") || "active",
    remarks: formData.get("remarks") || undefined,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid form data." };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const documentId = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = buildWholesaleDocumentStoragePath(auth.user.dealershipId, documentId, file.name);
  const storedFileName = storagePath.split("/").pop() ?? safeName;

  try {
    await uploadFile(WHOLESALE_DOCUMENT_BUCKET, storagePath, file);
    const fileId = await trackFile(
      file,
      WHOLESALE_DOCUMENT_BUCKET,
      storagePath,
      auth.user.dealershipId,
      auth.user.userId,
      { sourceEntity: "wholesale_document", sourceEntityId: documentId },
    );

    const { error } = await supabase.from("wholesale_documents").insert({
      id: documentId,
      dealership_id: auth.user.dealershipId,
      wholesale_dealer_id: auth.user.userId,
      vehicle_id: data.vehicleId?.trim() || null,
      document_name: data.documentName,
      document_type: data.documentType,
      category: data.category,
      description: data.description || null,
      original_file_name: file.name,
      stored_file_name: storedFileName,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      upload_date: new Date().toISOString(),
      expiry_date: data.expiryDate || null,
      status: data.status ?? "active",
      remarks: data.remarks || null,
      uploaded_by: auth.user.userId,
      file_id: fileId,
    });

    if (error) {
      throw new Error(error.message);
    }

    await revalidateWholesaleDocumentsPaths();
    return { success: true, documentId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create document.";
    return { success: false, error: message };
  }
}

export async function updateWholesaleDocument(
  id: string,
  payload: {
    documentType: string;
    vehicleId?: string;
    category: string;
    documentName: string;
    description?: string;
    expiryDate?: string;
    remarks?: string;
  },
): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("wholesale_documents")
    .select("id")
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: "Document not found." };
  }

  const { error } = await supabase
    .from("wholesale_documents")
    .update({
      document_type: payload.documentType,
      vehicle_id: payload.vehicleId?.trim() || null,
      category: payload.category,
      document_name: payload.documentName.trim(),
      description: payload.description?.trim() || null,
      expiry_date: payload.expiryDate || null,
      remarks: payload.remarks?.trim() || null,
    })
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId);

  if (error) {
    return { success: false, error: error.message };
  }

  await revalidateWholesaleDocumentsPaths();
  return { success: true, documentId: id };
}

export async function replaceWholesaleDocumentFile(
  id: string,
  formData: FormData,
): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select a file to upload." };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("wholesale_documents")
    .select("id, file_id, storage_path")
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: "Document not found." };
  }

  const storagePath = buildWholesaleDocumentStoragePath(
    auth.user.dealershipId,
    id,
    file.name,
  );
  const storedFileName = storagePath.split("/").pop() ?? file.name;

  try {
    await uploadFile(WHOLESALE_DOCUMENT_BUCKET, storagePath, file);

    if (existing.file_id) {
      await supabase
        .from("files")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", existing.file_id);
    }

    const fileId = await trackFile(
      file,
      WHOLESALE_DOCUMENT_BUCKET,
      storagePath,
      auth.user.dealershipId,
      auth.user.userId,
      { sourceEntity: "wholesale_document", sourceEntityId: id },
    );

    const { error } = await supabase
      .from("wholesale_documents")
      .update({
        original_file_name: file.name,
        stored_file_name: storedFileName,
        storage_path: storagePath,
        mime_type: file.type || "application/octet-stream",
        file_size: file.size,
        file_id: fileId,
        upload_date: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("dealership_id", auth.user.dealershipId);

    if (error) throw new Error(error.message);

    await revalidateWholesaleDocumentsPaths();
    return { success: true, documentId: id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to replace file.";
    return { success: false, error: message };
  }
}

export async function updateWholesaleDocumentStatus(
  id: string,
  status: string,
  remarks?: string,
): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("wholesale_documents")
    .update({
      status,
      remarks: remarks?.trim() || null,
    })
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  if (error) {
    return { success: false, error: error.message };
  }

  await revalidateWholesaleDocumentsPaths();
  return { success: true, documentId: id };
}

export async function deleteWholesaleDocument(id: string): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: doc } = await supabase
    .from("wholesale_documents")
    .select("file_id")
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!doc) {
    return { success: false, error: "Document not found." };
  }

  const { error } = await supabase
    .from("wholesale_documents")
    .update({ deleted_at: now })
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId);

  if (error) {
    return { success: false, error: error.message };
  }

  if (doc.file_id) {
    await supabase.from("files").update({ deleted_at: now }).eq("id", doc.file_id);
  }

  await revalidateWholesaleDocumentsPaths();
  return { success: true, documentId: id };
}

export async function restoreWholesaleDocument(id: string): Promise<DocumentActionResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("wholesale_documents")
    .select("file_id")
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .not("deleted_at", "is", null)
    .maybeSingle();

  if (!doc) {
    return { success: false, error: "Deleted document not found." };
  }

  const { error } = await supabase
    .from("wholesale_documents")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId);

  if (error) {
    return { success: false, error: error.message };
  }

  if (doc.file_id) {
    await supabase.from("files").update({ deleted_at: null }).eq("id", doc.file_id);
  }

  await revalidateWholesaleDocumentsPaths();
  return { success: true, documentId: id };
}

export async function getWholesaleDocumentSignedUrl(
  id: string,
): Promise<{ url: string; fileName: string } | { error: string }> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("wholesale_documents")
    .select("storage_path, original_file_name, document_name")
    .eq("id", id)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !doc) {
    return { error: "Document not found." };
  }

  try {
    const url = await getSignedUrl(WHOLESALE_DOCUMENT_BUCKET, doc.storage_path, 3600);
    return { url, fileName: doc.original_file_name || doc.document_name };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate download URL.";
    return { error: message };
  }
}

export async function bulkDeleteWholesaleDocuments(
  ids: string[],
): Promise<DocumentActionResult> {
  if (ids.length === 0) {
    return { success: false, error: "No documents selected." };
  }

  for (const id of ids) {
    const result = await deleteWholesaleDocument(id);
    if (!result.success) {
      return result;
    }
  }

  return { success: true };
}
