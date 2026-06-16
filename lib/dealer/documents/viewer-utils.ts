import type { RecentUploadFileType } from "@/lib/files-storage/types";
import type { FolderFileDetail } from "@/lib/files-storage/types";
import type { WholesaleDocument } from "@/lib/dealer/documents/types";

export function mimeToFileType(mimeType: string, fileName?: string): RecentUploadFileType {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (mimeType === "application/pdf" || ext === "pdf") return "pdf";
  if (mimeType.startsWith("image/") || ext === "jpg" || ext === "jpeg" || ext === "png") return "jpg";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  return "other";
}

export function wholesaleDocumentToViewerFile(
  doc: WholesaleDocument,
  signedUrl: string | null,
): FolderFileDetail {
  return {
    id: doc.id,
    fileName: doc.documentName,
    storagePath: doc.storagePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    fileType: mimeToFileType(doc.mimeType, doc.originalFileName),
    uploadedAt: doc.uploadDate,
    uploadedBy: doc.uploadedByName,
    sourceEntity: "wholesale_document",
    sourceEntityId: doc.id,
    sourceEntityName: doc.documentName,
    signedUrl,
  };
}
