"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, uploadFile, trackFile, getSignedUrl } from "@/lib/vehicles/server/utils";
import { getNormalizedFileType } from "../file-type-utils";
import type { FilesStorageFilters, FilesStorageReport, FolderFileDetail } from "../types";
import { getFilesStorageReport } from "./get-files-storage-report";

export async function fetchFilesStorageReportAction(
  filters: FilesStorageFilters,
): Promise<FilesStorageReport> {
  return getFilesStorageReport(filters);
}

export type UploadFileActionResult =
  | { success: true; fileId: string }
  | { success: false; error: string };

export async function uploadFileToStorageAction(
  formData: FormData,
): Promise<UploadFileActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    const bucket = (formData.get("bucket") as string) ?? "vehicle-documents";
    const sourceEntity = (formData.get("sourceEntity") as string) ?? undefined;
    const sourceEntityId = (formData.get("sourceEntityId") as string) ?? undefined;

    const validBuckets = [
      "vehicle-images",
      "vehicle-documents",
      "customer-images",
      "user-images",
      "expense-receipts",
      "deal-jacket-documents",
    ] as const;

    type Bucket = (typeof validBuckets)[number];
    const resolvedBucket: Bucket = validBuckets.includes(bucket as Bucket)
      ? (bucket as Bucket)
      : "vehicle-documents";

    const { dealershipId, userId } = auth.user;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const storagePath = `${dealershipId}/general/${timestamp}-${safeName}`;

    await uploadFile(resolvedBucket, storagePath, file);

    const fileId = await trackFile(file, resolvedBucket, storagePath, dealershipId, userId, {
      sourceEntity: sourceEntity as any,
      sourceEntityId,
    });

    revalidatePath("/dashboard/files-storage");
    return { success: true, fileId: fileId ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { success: false, error: message };
  }
}

export async function getFolderFilesAction(
  bucket: string,
): Promise<FolderFileDetail[]> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return [];

    const supabase = await createClient();
    const { dealershipId } = auth.user;

    const { data: files } = await supabase
      .from("files")
      .select("id, original_name, storage_path, file_size, mime_type, file_type, uploaded_at, uploaded_by, source_entity, source_entity_id")
      .eq("dealership_id", dealershipId)
      .eq("bucket", bucket)
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false });

    if (!files || files.length === 0) return [];

    const fileTypeMap: Record<string, FolderFileDetail["fileType"]> = {
      pdf: "pdf", jpg: "jpg", png: "jpg", webp: "jpg",
      xlsx: "xlsx", mp4: "mp4", mov: "mp4", other: "other",
    };

    const resolveEntityName = async (
      entity: string,
      id: string,
    ): Promise<string | null> => {
      try {
        switch (entity) {
          case "vehicle": {
            const { data, error } = await supabase
              .from("vehicles")
              .select("make, model, year")
              .is("deleted_at", null)
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return `${data.make} ${data.model} (${data.year})`;
          }
          case "customer": {
            const { data, error } = await supabase
              .from("customers")
              .select("name")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return data.name;
          }
          case "deal": {
            const { data, error } = await supabase
              .from("deals")
              .select("id")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return `Deal #${data.id.slice(0, 8)}`;
          }
          case "expense": {
            const { data, error } = await supabase
              .from("vehicle_expenses")
              .select("description")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return data.description ?? "Vehicle Expense";
          }
          case "dealership_expense": {
            const { data, error } = await supabase
              .from("dealership_expenses")
              .select("description")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return data.description ?? "Dealership Expense";
          }
          case "deal_jacket": {
            const { data, error } = await supabase
              .from("deal_jackets")
              .select("jacket_number")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return data.jacket_number;
          }
          case "user": {
            const { data, error } = await supabase
              .from("users")
              .select("full_name")
              .eq("id", id)
              .single();
            if (error || !data) return null;
            return data.full_name ?? "User";
          }
          default:
            return null;
        }
      } catch {
        return null;
      }
    };

    const entityNameCache: Record<string, Record<string, string | null>> = {};
    const getCachedEntityName = async (
      entity: string,
      id: string,
    ): Promise<string | null> => {
      if (!entity || !id) return null;
      if (!entityNameCache[entity]) entityNameCache[entity] = {};
      if (!(id in entityNameCache[entity])) {
        entityNameCache[entity][id] = await resolveEntityName(entity, id);
      }
      return entityNameCache[entity][id];
    };

    const userIds = [...new Set(files.map((f) => f.uploaded_by).filter(Boolean))];
    const userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", userIds);
      for (const u of users ?? []) {
        userMap[u.id] = u.full_name ?? "Unknown";
      }
    }

    const results: FolderFileDetail[] = [];
    for (const f of files) {
      let signedUrl: string | null = null;
      try {
        signedUrl = await getSignedUrl(bucket as any, f.storage_path, 3600);
      } catch {}

      const entityName = await getCachedEntityName(
        f.source_entity ?? "",
        f.source_entity_id ?? "",
      );

      results.push({
        id: f.id,
        fileName: f.original_name,
        storagePath: f.storage_path,
        fileSize: Number(f.file_size ?? 0),
        mimeType: f.mime_type,
        fileType: fileTypeMap[f.file_type] ?? "other",
        uploadedAt: f.uploaded_at,
        uploadedBy: userMap[f.uploaded_by] ?? "Unknown",
        sourceEntity: f.source_entity,
        sourceEntityId: f.source_entity_id,
        sourceEntityName: entityName ?? f.source_entity_id ?? null,
        signedUrl,
      });
    }

    return results;
  } catch (err) {
    console.error("getFolderFilesAction failed:", err);
    return [];
  }
}
