"use client";

import Image from "next/image";
import { CheckCircle2, FileText, FileStack } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SendDocumentFile } from "@/lib/sales-rep/send-document/types";
import { formatFileSize } from "@/lib/sales-rep/send-document/validation";

type Props = {
  files: SendDocumentFile[];
};

function DocumentThumbnail({ file }: { file: SendDocumentFile }) {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpg|jpeg|png)$/i.test(file.name);

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="relative w-full">
        <div
          className={cn(
            "relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60",
            !isImage && "flex items-center justify-center",
          )}
        >
          {isImage && file.previewUrl ? (
            <Image
              src={file.previewUrl}
              alt={file.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-2">
              <FileText className="h-8 w-8 text-red-400/80" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                PDF
              </span>
            </div>
          )}
          <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white shadow">
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
