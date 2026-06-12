import { uploadAndTrackFile } from "@/services/file-storage.service";
import { getFileSignedUrl } from "@/services/file-storage.service";
import type { StorageBucket } from "@/lib/vehicles/server/utils";
import { requireSendDocumentAccess } from "./auth";
import type { DocumentCenterFile } from "./types";

export async function uploadDocumentCenterFile(
  file: File,
): Promise<{ file: DocumentCenterFile } | { error: string }> {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return { error: auth.error };

  try {
    const result = await uploadAndTrackFile(
      file,
      "vehicle-documents" as StorageBucket,
      auth.user.dealershipId,
      auth.user.userId,
      { sourceEntity: "document_center", sourceEntityId: auth.user.dealershipId },
    );

    if (!result.fileId) {
      return { error: "Failed to register uploaded file." };
    }

    const previewUrl = await getFileSignedUrl(
      result.storagePath,
      "vehicle-documents",
      3600,
    );

    return {
      file: {
        id: result.fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        fileType: file.name.split(".").pop()?.toLowerCase() ?? "other",
        sourceEntity: "document_center",
        uploadedAt: new Date().toISOString(),
        previewUrl,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return { error: message };
  }
}
