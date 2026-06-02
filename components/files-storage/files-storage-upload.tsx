"use client";

import * as React from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/vehicles/actions/utils";
import { uploadFileToStorageAction } from "@/lib/files-storage/server/actions";
import type { RecentUpload } from "@/lib/files-storage/types";

const MAX_SIZE_MB = 250;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "video/mp4",
  "video/quicktime",
];

function inferFileType(name: string): RecentUpload["fileType"] {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp")
    return "jpg";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "mp4" || ext === "mov") return "mp4";
  return "other";
}

type Props = {
  onUpload: (upload: RecentUpload) => void;
};

export default function FilesStorageUpload({ onUpload }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || uploading) return;

    setUploading(true);

    for (const file of Array.from(fileList)) {
      const err = validateFile(file, {
        maxSizeMB: MAX_SIZE_MB,
        allowedTypes: ALLOWED_TYPES,
      });
      if (err) {
        setError(err);
        toast.error(`${file.name}: ${err}`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "vehicle-documents");

        const result = await uploadFileToStorageAction(formData);

        if (!result.success) {
          toast.error(`${file.name}: ${result.error}`);
          continue;
        }

        const upload: RecentUpload = {
          id: result.fileId || `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
          category: "Other Files",
          uploadedAt: new Date().toISOString(),
          sizeBytes: file.size,
          fileType: inferFileType(file.name),
        };

        setError(null);
        onUpload(upload);
        toast.success(`${file.name} uploaded successfully`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
  };

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-4 shadow-none">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 transition-colors",
          dragOver
            ? "border-blue-500 bg-blue-500/5"
            : "border-slate-600 bg-[#0a101c]/20",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-blue-400" />
            <p className="mb-3 text-center text-[12.5px] text-slate-400">
              Uploading files...
            </p>
          </>
        ) : (
          <>
            <CloudUpload className="mb-3 h-10 w-10 text-blue-400" />
            <p className="mb-3 text-center text-[12.5px] text-slate-400">
              Drag & drop files here to upload or
            </p>
            <Button
              theme="dark"
              type="button"
              size="lg"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Select Files
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={ALLOWED_TYPES.join(",")}
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {error && (
          <p className="mt-2 text-[11px] text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="mt-3 text-center text-[10.5px] text-slate-500">
        Maximum file size: 250MB
      </p>
    </Card>
  );
}
