"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";

const schema = z.object({
  periodId: z.string().uuid(),
  fileName: z.string().min(1),
});

export type UploadFilingDocumentResult =
  | { success: true; documentId: string }
  | { success: false; error: string };

export async function uploadFilingDocument(
  periodId: string,
  fileName: string,
  file: File,
): Promise<UploadFilingDocumentResult> {
  const auth = await authenticateUser();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = schema.safeParse({ periodId, fileName });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { dealershipId } = auth.user;
  const supabase = await createClient();

  // Verify period belongs to dealership
  const { data: period } = await supabase
    .from("tax_filing_periods")
    .select("id")
    .eq("id", periodId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!period) {
    return { success: false, error: "Filing period not found" };
  }

  // Upload to Supabase Storage
  const filePath = `${dealershipId}/${periodId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("tax-filings")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Save metadata to database
  const { data: doc, error: dbError } = await supabase
    .from("tax_filing_documents")
    .insert({
      filing_period_id: periodId,
      file_name: fileName,
      file_path: filePath,
    })
    .select("id")
    .single();

  if (dbError) {
    // Clean up uploaded file
    await supabase.storage.from("tax-filings").remove([filePath]);
    return { success: false, error: dbError.message };
  }

  return { success: true, documentId: doc.id };
}

export async function deleteFilingDocument(
  documentId: string,
): Promise<UploadFilingDocumentResult> {
  const auth = await authenticateUser();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("tax_filing_documents")
    .select("id, file_path, filing_period_id")
    .eq("id", documentId)
    .single();

  if (!doc) {
    return { success: false, error: "Document not found" };
  }

  // Verify access through period
  const { data: period } = await supabase
    .from("tax_filing_periods")
    .select("dealership_id")
    .eq("id", doc.filing_period_id)
    .single();

  if (!period || period.dealership_id !== auth.user.dealershipId) {
    return { success: false, error: "Access denied" };
  }

  // Delete from storage
  await supabase.storage.from("tax-filings").remove([doc.file_path]);

  // Delete from database
  const { error } = await supabase
    .from("tax_filing_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, documentId: doc.id };
}
