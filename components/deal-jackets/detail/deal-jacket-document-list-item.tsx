"use client";

import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketFileItem } from "@/lib/deal-jackets/detail-types";
import { toRecentUploadFileType } from "@/lib/deal-jackets/map-deal-jacket-file";
import FileTypeIcon from "@/components/files-storage/file-type-icon";
import { cn } from "@/lib/utils";

type Props = {
  doc: DealJacketFileItem;
  onPreview: (doc: DealJacketFileItem) => void;
  onDownload?: (doc: DealJacketFileItem) => void;
  className?: string;
  compact?: boolean;
};

export default function DealJacketDocumentListItem({
  doc,
  onPreview,
  onDownload,
  className,
  compact = false,
}: Props) {
  const fileType = toRecentUploadFileType(doc.fileType, doc.name);

  if (compact) {
    return (
      <li
        className={cn(
          "flex items-center gap-2.5 border-b border-slate-800/60 py-2.5 last:border-0",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => onPreview(doc)}
          disabled={!doc.fileUrl}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileTypeIcon fileType={fileType} className="h-7 w-7 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-white">
            {doc.name}
          </span>
        </button>
        <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
          {formatDisplayDate(doc.uploadedAt)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-7 w-7 shrink-0 border-slate-700 text-slate-400"
          aria-label="Preview document"
          disabled={!doc.fileUrl}
          onClick={() => onPreview(doc)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </li>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-sm border border-slate-700 bg-transparent p-3.5 transition hover:border-slate-600 hover:bg-slate-800/20",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onPreview(doc)}
        disabled={!doc.fileUrl}
        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileTypeIcon fileType={fileType} className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium text-white">
            {doc.name}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Uploaded {formatDisplayDate(doc.uploadedAt)}
          </div>
        </div>
      </button>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-slate-700 text-slate-400"
          aria-label="Preview document"
          disabled={!doc.fileUrl}
          onClick={() => onPreview(doc)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-slate-700 text-slate-400"
          aria-label="Download document"
          disabled={!doc.fileUrl || !onDownload}
          onClick={() => onDownload?.(doc)}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function DealJacketDocumentsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Image
        src="/doc.png"
        alt=""
        width={40}
        height={40}
        className="mb-3 opacity-60"
      />
      <p className="text-[13px] text-slate-500">No documents uploaded yet.</p>
    </div>
  );
}
