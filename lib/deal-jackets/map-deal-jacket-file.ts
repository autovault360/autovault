import { getNormalizedFileType } from "@/lib/files-storage/file-type-utils";
import type { RecentUploadFileType } from "@/lib/files-storage/types";
import type { FolderFileDetail } from "@/lib/files-storage/types";
import type { DealJacketFileItem } from "./detail-types";

export function toRecentUploadFileType(
  mimeType: string,
  fileName?: string,
): RecentUploadFileType {
  const normalized = getNormalizedFileType(mimeType, fileName);
  if (normalized === "png" || normalized === "webp") return "jpg";
  if (
    normalized === "pdf" ||
    normalized === "xlsx" ||
    normalized === "mp4"
  ) {
    return normalized;
  }
  return "other";
}

export function mapDealJacketFileToFolderDetail(
  doc: DealJacketFileItem,
): FolderFileDetail {
  return {
    id: doc.id,
    fileName: doc.name,
    storagePath: doc.fileUrl,
    fileSize: 0,
    mimeType: doc.fileType,
    fileType: toRecentUploadFileType(doc.fileType, doc.name),
    uploadedAt: doc.uploadedAt,
    uploadedBy: "",
    sourceEntity: null,
    sourceEntityId: null,
    sourceEntityName: null,
    signedUrl: doc.fileUrl,
  };
}

export async function downloadDealJacketFile(doc: DealJacketFileItem): Promise<void> {
  if (!doc.fileUrl) return;
  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: doc.fileUrl, fileName: doc.name }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(doc.fileUrl, "_blank");
  }
}
