"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, FileText, FileStack } from "lucide-react";
import FileTypeIcon from "@/components/files-storage/file-type-icon";
import { toRecentUploadFileType } from "@/lib/deal-jackets/map-deal-jacket-file";
import {
  isImageSendDocumentFile,
  isPdfSendDocumentFile,
} from "@/lib/sales-rep/send-document/file-type-helpers";
import type { SendDocumentFile } from "@/lib/sales-rep/send-document/types";
import { formatFileSize } from "@/lib/sales-rep/send-document/validation";
import SendDocumentPdfPreview from "./send-document-pdf-preview";

type Props = {
  files: SendDocumentFile[];
};

function DocumentThumbnail({ file }: { file: SendDocumentFile }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const [useNativeImg, setUseNativeImg] = useState(false);
  const isImage = isImageSendDocumentFile(file);
  const isPdf = isPdfSendDocumentFile(file);
  const previewUrl = file.previewUrl;
  const showImage = isImage && previewUrl && !previewFailed;
  const showPdf = isPdf && previewUrl && !previewFailed && !isImage;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="relative w-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-slate-700 bg-white">
          {showImage && !useNativeImg ? (
            <Image
              src={previewUrl}
              alt={file.name}
              fill
              unoptimized
              sizes="(max-width: 1280px) 33vw, 200px"
              className="object-contain"
              onError={() => setUseNativeImg(true)}
            />
          ) : showImage && useNativeImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={file.name}
              className="absolute inset-0 h-full w-full object-contain"
              onError={() => setPreviewFailed(true)}
            />
          ) : showPdf ? (
            <SendDocumentPdfPreview
              url={previewUrl}
              className="absolute inset-0"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white p-3">
              <FileTypeIcon
                fileType={toRecentUploadFileType(file.type, file.name)}
                className="h-10 w-10"
              />
            </div>
          )}

          <span className="absolute bottom-1.5 right-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white shadow">
            <CheckCircle2 className="h-3 w-3" />
          </span>
        </div>
      </div>
      <p className="mt-1.5 w-full truncate text-center text-[10px] font-medium text-slate-300">
        {file.name}
      </p>
      <p className="text-[9.5px] text-slate-500">{formatFileSize(file.size)}</p>
    </div>
  );
}

export default function SendDocumentPreviewPanel({ files }: Props) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-[#0f1520] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-400">
            <FileStack className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[13px] font-semibold text-white">
            Document Preview
          </h3>
        </div>
        {files.length > 0 && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            {files.length} {files.length === 1 ? "File" : "Files"}
          </span>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/30 px-4 py-8 text-center">
          <FileText className="mb-2 h-8 w-8 text-slate-600" />
          <p className="text-[11px] text-slate-500">
            Upload documents to see preview thumbnails here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {files.map((file) => (
            <DocumentThumbnail key={file.id} file={file} />
          ))}
        </div>
      )}
    </section>
  );
}
