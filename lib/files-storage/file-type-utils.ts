export type NormalizedFileType = "pdf" | "jpg" | "png" | "webp" | "xlsx" | "mp4" | "other";

export function getNormalizedFileType(mimeType: string, fileName?: string): NormalizedFileType {
  const ext = fileName?.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel"
  ) return "xlsx";
  if (mimeType.startsWith("video/")) return "mp4";

  if (ext === "pdf") return "pdf";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "mp4" || ext === "mov") return "mp4";

  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
