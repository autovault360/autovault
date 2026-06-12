import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { verifyStorageObjectExists } from "@/services/file-storage.service";
import type { StorageBucket } from "@/lib/vehicles/server/utils";
import { requireSendDocumentAccess } from "./auth";
import type { DocumentCenterListResponse } from "./types";
import { getSourceLabel } from "../source-labels";

export { getSourceLabel };

export async function listDocumentCenterFiles(params?: {
  search?: string;
  sourceEntity?: string;
  fileType?: string;
  page?: number;
  pageSize?: number;
}): Promise<DocumentCenterListResponse | { error: string }> {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return { error: auth.error };

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));
  const search = params?.search?.trim() ?? "";
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  let query = supabase
    .from("files")
    .select(
      "id, original_name, file_size, mime_type, file_type, source_entity, uploaded_at, bucket, storage_path",
      { count: "exact" },
    )
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  if (params?.sourceEntity && params.sourceEntity !== "all") {
    query = query.eq("source_entity", params.sourceEntity);
  }

  if (params?.fileType === "pdf") {
    query = query.eq("file_type", "pdf");
  } else if (params?.fileType === "image") {
    query = query.in("file_type", ["jpg", "jpeg", "png", "webp", "gif"]);
  }

  if (search) {
    query = query.ilike("original_name", `%${search}%`);
  }

  const { data: rows, error, count } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    return { error: error.message };
  }

  const files = (
    await Promise.all(
      (rows ?? []).map(async (row) => {
        const isAvailable = await verifyStorageObjectExists(row.bucket, row.storage_path);
        const previewUrl = isAvailable
          ? await getSignedUrl(row.bucket as StorageBucket, row.storage_path, 3600).catch(
              () => null,
            )
          : null;

        return {
          id: row.id,
          name: row.original_name,
          size: Number(row.file_size ?? 0),
          mimeType: row.mime_type,
          fileType: row.file_type,
          sourceEntity: row.source_entity,
          uploadedAt: row.uploaded_at,
          previewUrl,
          isAvailable,
        };
      }),
    )
  ).filter((file) => file.isAvailable);

  return {
    files,
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}
