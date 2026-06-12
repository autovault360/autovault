import type { SupabaseClient } from "@supabase/supabase-js";
import { uploadFile, trackFile, getNormalizedFileType } from "@/lib/vehicles/server/utils";
import type { StorageBucket } from "@/lib/vehicles/server/utils";

export type UploadedDealJacketDocument = {
  path: string;
  name: string;
  type: string;
};

const DEAL_JACKET_BUCKET: StorageBucket = "deal-jacket-documents";

export function inferDocumentBucket(storagePath: string): StorageBucket {
  if (storagePath.includes("/deal_jackets/")) {
    return "deal-jacket-documents";
  }
  return "vehicle-documents";
}

function buildStoragePath(
  dealershipId: string,
  dealJacketId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${dealershipId}/deal_jackets/${dealJacketId}/${Date.now()}-${safeName}`;
}

export async function registerDealJacketFileInRegistry(
  supabase: SupabaseClient,
  params: {
    dealershipId: string;
    dealJacketId: string;
    uploadedBy: string;
    storagePath: string;
    bucket: StorageBucket;
    originalName: string;
    mimeType: string;
    fileSize?: number;
  },
): Promise<void> {
  const fileType = await getNormalizedFileType(params.mimeType, params.originalName);

  const { data: existing } = await supabase
    .from("files")
    .select("id")
    .eq("dealership_id", params.dealershipId)
    .eq("bucket", params.bucket)
    .eq("storage_path", params.storagePath)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("files").insert({
    dealership_id: params.dealershipId,
    bucket: params.bucket,
    storage_path: params.storagePath,
    original_name: params.originalName,
    file_size: params.fileSize ?? 0,
    mime_type: params.mimeType,
    file_type: fileType,
    source_entity: "deal_jacket",
    source_entity_id: params.dealJacketId,
    uploaded_by: params.uploadedBy,
  });

  if (error) {
    console.error("registerDealJacketFileInRegistry failed:", error.message);
  }
}

export async function uploadDealJacketDocuments(
  files: File[],
  dealershipId: string,
  userId: string,
  dealJacketId: string,
): Promise<UploadedDealJacketDocument[]> {
  const uploaded: UploadedDealJacketDocument[] = [];

  for (const file of files) {
    const storagePath = buildStoragePath(dealershipId, dealJacketId, file.name);

    try {
      await uploadFile(DEAL_JACKET_BUCKET, storagePath, file);
      await trackFile(file, DEAL_JACKET_BUCKET, storagePath, dealershipId, userId, {
        sourceEntity: "deal_jacket",
        sourceEntityId: dealJacketId,
      });

      uploaded.push({
        path: storagePath,
        name: file.name,
        type: file.type || "application/octet-stream",
      });
    } catch (err) {
      console.error(`Failed to upload deal jacket document ${file.name}:`, err);
    }
  }

  return uploaded;
}

export async function insertDealJacketDocumentRecords(
  supabase: SupabaseClient,
  params: {
    dealershipId: string;
    dealJacketId: string;
    createdBy: string;
    documents: UploadedDealJacketDocument[];
  },
): Promise<void> {
  if (params.documents.length === 0) return;

  const docRows = params.documents.map((doc) => ({
    dealership_id: params.dealershipId,
    deal_jacket_id: params.dealJacketId,
    file_url: doc.path,
    file_type: doc.type,
    document_name: doc.name,
    created_by: params.createdBy,
  }));

  const { error } = await supabase.from("deal_jacket_documents").insert(docRows);

  if (error) {
    console.error("deal_jacket_documents insert failed:", error.message);
  }
}

export async function persistDealJacketDocuments(
  supabase: SupabaseClient,
  params: {
    files: File[];
    dealershipId: string;
    userId: string;
    dealJacketId: string;
  },
): Promise<UploadedDealJacketDocument[]> {
  const uploaded = await uploadDealJacketDocuments(
    params.files,
    params.dealershipId,
    params.userId,
    params.dealJacketId,
  );

  await insertDealJacketDocumentRecords(supabase, {
    dealershipId: params.dealershipId,
    dealJacketId: params.dealJacketId,
    createdBy: params.userId,
    documents: uploaded,
  });

  return uploaded;
}
