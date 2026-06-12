import { getNormalizedFileType } from "@/lib/files-storage/file-type-utils";
import type { SendDocumentFile } from "@/lib/sales-rep/send-document/types";

const IMAGE_TYPES = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export function isImageSendDocumentFile(file: SendDocumentFile): boolean {
  if (file.type.startsWith("image/")) return true;

  const normalized = getNormalizedFileType(file.type, file.name);
  if (IMAGE_TYPES.has(normalized)) return true;

  if (file.fileType && IMAGE_TYPES.has(file.fileType)) return true;

  return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
}

export function isPdfSendDocumentFile(file: SendDocumentFile): boolean {
  if (file.type === "application/pdf") return true;
  if (file.fileType === "pdf") return true;
  return /\.pdf$/i.test(file.name);
}

export function isOfficeSendDocumentFile(file: SendDocumentFile): boolean {
  return (
    file.type.includes("word") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("presentation") ||
    file.type.includes("officedocument") ||
    file.type === "application/msword" ||
    /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name)
  );
}

export function canEmbedRemotePreview(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function getGoogleViewerUrl(url: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}
