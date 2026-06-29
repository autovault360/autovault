"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatFileSize } from "@/lib/vehicles/actions/utils";
import { formatUploadTime } from "@/lib/files-storage/format-utils";
import FileTypeIcon from "./file-type-icon";
import type { RecentUpload, FolderFileDetail } from "@/lib/files-storage/types";
import DocumentViewerModal from "./document-viewer-modal";

type Props = {
  uploads: RecentUpload[];
};

function toFolderFileDetail(upload: RecentUpload & { mimeType?: string; storagePath?: string; signedUrl?: string; uploadedBy?: string }): FolderFileDetail {
  return {
    id: upload.id,
    fileName: upload.fileName,
    storagePath: upload.storagePath ?? "",
    fileSize: upload.sizeBytes,
    mimeType: upload.mimeType ?? "application/octet-stream",
    fileType: upload.fileType,
    uploadedAt: upload.uploadedAt,
    uploadedBy: upload.uploadedBy ?? "Unknown",
    sourceEntity: null,
    sourceEntityId: null,
    sourceEntityName: null,
    signedUrl: upload.signedUrl ?? null,
  };
}

export default function FilesStorageRecentUploads({ uploads }: Props) {
  const [previewFile, setPreviewFile] = useState<FolderFileDetail | null>(null);

  function handlePreview(upload: RecentUpload) {
    const detail = toFolderFileDetail(upload);
    setPreviewFile(detail);
  }

  return (
    <Card className="flex max-h-[400px] flex-col rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Recently Uploaded
      </h2>

      <div className="min-h-0 flex-1 space-y-0 overflow-y-auto">
        {uploads.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-slate-500">
            No recent uploads.
          </p>
        ) : (
          uploads.map((upload) => (
            <button
              key={upload.id}
              type="button"
              onClick={() => handlePreview(upload)}
              className="flex w-full items-center gap-3 border-b border-slate-800/50 py-3 text-left last:border-0 hover:bg-slate-800/30 transition-colors"
            >
              <FileTypeIcon fileType={upload.fileType} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-white">
                  {upload.fileName}
                </div>
                <div className="text-[10px] text-slate-500">{upload.category}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[13px] text-slate-400">
                  {formatUploadTime(upload.uploadedAt)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {formatFileSize(upload.sizeBytes)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {previewFile && (
        <DocumentViewerModal
          file={previewFile}
          files={[previewFile]}
          open={!!previewFile}
          onOpenChange={(open) => { if (!open) setPreviewFile(null); }}
        />
      )}
    </Card>
  );
}
