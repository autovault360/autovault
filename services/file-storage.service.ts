import { createClient, createServiceClient } from "@/lib/supabase/server";
import { uploadFile as rawUploadFile, getSignedUrl } from "@/lib/vehicles/server/utils";
import type { StorageBucket } from "@/lib/vehicles/server/utils";
import { getNormalizedFileType, type NormalizedFileType } from "@/lib/files-storage/file-type-utils";
import type { FilesStorageReport, StorageFolder, RecentUpload, StorageBreakdownSegment } from "@/lib/files-storage/types";

export type SourceEntity =
  | "vehicle"
  | "customer"
  | "deal"
  | "expense"
  | "deal_jacket"
  | "dealership_expense"
  | "user"
  | "document_center"
  | "wholesale_document";

export type TrackFileOptions = {
  sourceEntity?: SourceEntity;
  sourceEntityId?: string;
};

export type UploadResult = {
  storagePath: string;
  fileId: string;
};

/**
 * Upload a file to Supabase Storage AND register it in the files table.
 */
export async function uploadAndTrackFile(
  file: File,
  bucket: StorageBucket,
  dealershipId: string,
  userId: string,
  options?: TrackFileOptions,
): Promise<UploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();

  let folder: string;
  const src = options?.sourceEntity ?? "general";
  const srcId = options?.sourceEntityId ?? "unknown";
  folder = `${dealershipId}/${src}/${srcId}`;

  const storagePath = `${folder}/${timestamp}-${safeName}`;

  await rawUploadFile(bucket, storagePath, file);

  const supabase = await createClient();
  const fileType = getNormalizedFileType(file.type, file.name);

  const { data, error } = await supabase
    .from("files")
    .insert({
      dealership_id: dealershipId,
      bucket,
      storage_path: storagePath,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
      file_type: fileType,
      source_entity: options?.sourceEntity ?? null,
      source_entity_id: options?.sourceEntityId ?? null,
      uploaded_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to track file in files table:", error.message);
    return { storagePath, fileId: "" };
  }

  return { storagePath, fileId: data.id };
}

/**
 * Get a signed URL for a file from the files table.
 */
export async function getFileSignedUrl(
  storagePath: string,
  bucket: StorageBucket,
  expiresInSeconds = 3600,
): Promise<string | null> {
  try {
    return await getSignedUrl(bucket, storagePath, expiresInSeconds);
  } catch {
    return null;
  }
}

/**
 * Check whether an object exists in Supabase Storage.
 */
export async function verifyStorageObjectExists(
  bucket: string,
  storagePath: string,
): Promise<boolean> {
  try {
    const signedUrl = await getSignedUrl(bucket as StorageBucket, storagePath, 60);
    const response = await fetch(signedUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return true;
  } catch {
    // fall through to storage API check
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  return !error && !!data;
}

/**
 * Download file bytes from storage for server-side use (e.g. email attachments).
 */
export async function downloadFileBuffer(
  bucket: string,
  storagePath: string,
): Promise<{ data: Buffer } | { error: string }> {
  const supabase = createServiceClient();

  const { data: blob, error } = await supabase.storage.from(bucket).download(storagePath);
  if (!error && blob) {
    return { data: Buffer.from(await blob.arrayBuffer()) };
  }

  const storageError = error?.message ?? "Object not found";

  try {
    const signedUrl = await getSignedUrl(bucket as StorageBucket, storagePath, 3600);
    const response = await fetch(signedUrl, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      return {
        error: `"${storagePath}" is not available in storage. The file record exists but the uploaded file is missing.`,
      };
    }
    return { data: Buffer.from(await response.arrayBuffer()) };
  } catch {
    return {
      error: `Could not read file from storage: ${storageError}`,
    };
  }
}

/**
 * Soft-delete a file from the files table.
 */
export async function deleteFileRecord(fileId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", fileId);
}

/**
 * Soft-delete all files linked to a source entity.
 */
export async function deleteFilesBySource(
  dealershipId: string,
  sourceEntity: SourceEntity,
  sourceEntityId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("dealership_id", dealershipId)
    .eq("source_entity", sourceEntity)
    .eq("source_entity_id", sourceEntityId);
}

export type StorageReport = {
  totalBytes: number;
  totalFiles: number;
  totalImages: number;
  lastUploadAt: string | null;
  lastUploadBy: string | null;
  breakdown: Array<{ category: string; count: number; totalSize: number }>;
  folders: Array<{ bucket: string; count: number; totalSize: number }>;
  recentUploads: Array<{
    id: string;
    originalName: string;
    bucket: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedByName: string;
    storagePath: string;
  }>;
};

/**
 * Get storage report for a dealership - powers the Files & Storage dashboard.
 */
export async function getDealershipStorageReport(dealershipId: string): Promise<StorageReport> {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("files")
    .select("id, file_size, mime_type, uploaded_at, uploaded_by, original_name, bucket, file_type, storage_path")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  const all = stats ?? [];

  const totalFiles = all.length;
  const totalBytes = all.reduce((sum, f) => sum + Number(f.file_size ?? 0), 0);
  const images = all.filter((f) => f.mime_type?.startsWith("image/"));
  const totalImages = images.length;
  const last = all[0];

  const categories: Record<string, { count: number; totalSize: number }> = {};
  for (const f of all) {
    let cat = "other";
    if (f.mime_type?.startsWith("image/")) cat = "images";
    else if (f.mime_type?.startsWith("video/")) cat = "videos";
    else if (
      f.mime_type === "application/pdf" ||
      f.mime_type === "text/plain" ||
      f.mime_type?.includes("spreadsheet") ||
      f.mime_type?.includes("document")
    ) cat = "documents";
    if (!categories[cat]) categories[cat] = { count: 0, totalSize: 0 };
    categories[cat].count++;
    categories[cat].totalSize += Number(f.file_size ?? 0);
  }

  const folderMap: Record<string, { count: number; totalSize: number }> = {};
  for (const f of all) {
    if (!folderMap[f.bucket]) folderMap[f.bucket] = { count: 0, totalSize: 0 };
    folderMap[f.bucket].count++;
    folderMap[f.bucket].totalSize += Number(f.file_size ?? 0);
  }

  const userIds = [...new Set(all.map((f) => f.uploaded_by).filter(Boolean))] as string[];
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

  return {
    totalBytes,
    totalFiles,
    totalImages,
    lastUploadAt: last?.uploaded_at ?? null,
    lastUploadBy: last?.uploaded_by ? (userMap[last.uploaded_by] ?? "Unknown") : null,
    breakdown: Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      totalSize: data.totalSize,
    })),
    folders: Object.entries(folderMap).map(([bucket, data]) => ({
      bucket,
      count: data.count,
      totalSize: data.totalSize,
    })),
    recentUploads: all.slice(0, 10).map((f) => ({
      id: f.id,
      originalName: f.original_name,
      bucket: f.bucket,
      fileSize: Number(f.file_size ?? 0),
      fileType: f.file_type,
      uploadedAt: f.uploaded_at,
      uploadedByName: f.uploaded_by ? (userMap[f.uploaded_by] ?? "Unknown") : "Unknown",
      storagePath: f.storage_path,
    })),
  };
}

/**
 * Convert StorageReport to FilesStorageReport (for the UI types).
 */
export function toFilesStorageReport(report: StorageReport): FilesStorageReport {
  const totalStorageGb = 1024;
  const usedStorageGb = +(report.totalBytes / 1e9).toFixed(2);
  const usagePercent = Math.min(100, +((report.totalBytes / (totalStorageGb * 1e9)) * 100).toFixed(1));

  const colorMap: Record<string, string> = {
    documents: "#3B82F6",
    images: "#22C55E",
    videos: "#A855F7",
    other: "#F97316",
  };

  const iconColorMap: Record<string, "yellow" | "green" | "orange" | "red" | "blue" | "purple"> = {
    "vehicle-images": "green",
    "vehicle-documents": "blue",
    "customer-images": "purple",
    "user-images": "purple",
    "expense-receipts": "orange",
    "deal-jacket-documents": "yellow",
  };

  const folderNameMap: Record<string, string> = {
    "vehicle-images": "Vehicle Photos",
    "vehicle-documents": "Vehicle Documents",
    "customer-images": "Customer Images",
    "user-images": "User Avatars",
    "expense-receipts": "Expenses & Receipts",
    "deal-jacket-documents": "Deal Jackets",
    "wholesale-dealer-documents": "Wholesale Dealer Documents",
  };

  const folderDescMap: Record<string, string> = {
    "vehicle-images": "Vehicle inventory images",
    "vehicle-documents": "Vehicle and customer documents",
    "customer-images": "Customer profile images",
    "user-images": "User profile avatars",
    "expense-receipts": "Expense receipts and invoices",
    "deal-jacket-documents": "All deal related documents",
    "wholesale-dealer-documents": "Wholesale dealer document vault",
  };

  const totalFromBreakdown = report.breakdown.reduce((s, b) => s + b.totalSize, 0);

  return {
    totalStorageGb,
    usedStorageGb,
    totalFiles: report.totalFiles,
    totalImages: report.totalImages,
    lastUpload: {
      at: report.lastUploadAt ?? "",
      by: report.lastUploadBy ?? "N/A",
    },
    usagePercent,
    breakdown: report.breakdown.map((b) => ({
      id: b.category,
      label: b.category.charAt(0).toUpperCase() + b.category.slice(1),
      color: colorMap[b.category] ?? "#94A3B8",
      sizeGb: +(b.totalSize / 1e9).toFixed(2),
      percent: totalFromBreakdown > 0
        ? +((b.totalSize / totalFromBreakdown) * 100).toFixed(1)
        : 0,
    })),
    folders: report.folders.map((f) => ({
      id: f.bucket,
      name: folderNameMap[f.bucket] ?? f.bucket,
      description: folderDescMap[f.bucket] ?? "Files",
      fileCount: f.count,
      sizeGb: +(f.totalSize / 1e9).toFixed(2),
      lastModified: report.recentUploads.find((r) => r.bucket === f.bucket)?.uploadedAt ?? "",
      iconColor: iconColorMap[f.bucket] ?? "blue",
    })),
    recentUploads: report.recentUploads.map((r) => ({
      id: r.id,
      fileName: r.originalName,
      category: folderNameMap[r.bucket] ?? r.bucket,
      uploadedAt: r.uploadedAt,
      sizeBytes: r.fileSize,
      fileType: r.fileType as RecentUpload["fileType"],
    })),
    storageTips: [
      "Delete old or unused files to free up space",
      "Compress large video files before uploading",
      "Archive completed deal jackets regularly",
      "Review and clean up storage monthly",
    ],
    aiSuggestions: [
      { id: "sug-1", label: "Show me all deal jackets from this month", icon: "chart" },
      { id: "sug-2", label: "Which expenses are missing receipts?", icon: "clock" },
      { id: "sug-3", label: "Show me my top profitable vehicles", icon: "dollar" },
      { id: "sug-4", label: "What documents are missing in deal RO-1012?", icon: "file" },
      { id: "sug-5", label: "Show me pending CDTFA filings", icon: "image" },
      { id: "sug-6", label: "How much storage space do I have left?", icon: "cloud" },
    ],
  };
}
