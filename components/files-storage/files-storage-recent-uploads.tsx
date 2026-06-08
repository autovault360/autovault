"use client";

import { Card } from "@/components/ui/card";
import { formatFileSize } from "@/lib/vehicles/actions/utils";
import { formatUploadTime } from "@/lib/files-storage/format-utils";
import FileTypeIcon from "./file-type-icon";
import type { RecentUpload } from "@/lib/files-storage/types";

type Props = {
  uploads: RecentUpload[];
};

export default function FilesStorageRecentUploads({ uploads }: Props) {
  return (
    <Card className="flex flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
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
            <div
              key={upload.id}
              className="flex items-center gap-3 border-b border-slate-800/50 py-3 last:border-0"
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
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
