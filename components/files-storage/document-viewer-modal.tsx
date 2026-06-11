"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, Download, ExternalLink, FileIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatUploadTime } from "@/lib/files-storage/format-utils";
import { formatFileSize } from "@/lib/files-storage/file-type-utils";
import type { FolderFileDetail } from "@/lib/files-storage/types";

type Props = {
  file: FolderFileDetail | null;
  files: FolderFileDetail[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DocumentViewerModal({
  file,
  files,
  open,
  onOpenChange,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [contentLoading, setContentLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const idx = files.findIndex((f) => f.id === file.id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [file, files]);

  const currentFile = currentIndex >= 0 && currentIndex < files.length
    ? files[currentIndex]
    : file;

  useEffect(() => {
    if (!currentFile) return;
    if (currentFile.id !== prevFileIdRef.current) {
      prevFileIdRef.current = currentFile.id;
      setContentLoading(true);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    }
  }, [currentFile?.id]);

  useEffect(() => {
    if (!open) return;
    scrollContainerRef.current?.scrollTo({ top: 0, left: 0 });
  }, [currentFile?.id, open]);

  const handleContentLoaded = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => setContentLoading(false), 150);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= files.length) return;
      setCurrentIndex(index);
    },
    [files],
  );

  if (!currentFile) return null;

  const isImage = currentFile.mimeType.startsWith("image/");
  const isPdf = currentFile.mimeType === "application/pdf";
  const isOffice =
    currentFile.mimeType.includes("word") ||
    currentFile.mimeType.includes("spreadsheet") ||
    currentFile.mimeType.includes("presentation") ||
    currentFile.mimeType.includes("officedocument");

  const googleViewerUrl = currentFile.signedUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(currentFile.signedUrl)}&embedded=true`
    : null;

  const needsLoading = isImage || isPdf || isOffice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className="!inset-0 !flex !h-[100dvh] !max-h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-0 !overflow-hidden !rounded-none !border-0 !p-0 !ring-0 !bg-transparent text-white"
      >
        <DialogTitle className="sr-only">
          {currentFile.fileName}
        </DialogTitle>

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-transparent px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FileIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-medium text-white">
                {currentFile.fileName}
              </h2>
              <div className="flex items-center gap-2 text-[13px] text-slate-400">
                <span>{formatFileSize(currentFile.fileSize)}</span>
                <span className="text-slate-600">|</span>
                <span>{currentFile.mimeType}</span>
                <span className="text-slate-600">|</span>
                <span>{formatUploadTime(currentFile.uploadedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex <= 0}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Previous file"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-[11px] text-slate-400">
              {currentIndex >= 0
                ? `${currentIndex + 1} / ${files.length}`
                : "..."}
            </span>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex < 0 || currentIndex >= files.length - 1}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Next file"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-white/10" />

            {currentFile.signedUrl && (
              <a
                href={currentFile.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-blue-400"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={async () => {
                if (!currentFile.signedUrl) return;
                try {
                  const res = await fetch("/api/download", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      url: currentFile.signedUrl,
                      fileName: currentFile.fileName,
                    }),
                  });
                  if (!res.ok) {
                    console.error("Download failed", res.status);
                    return;
                  }
                  const blob = await res.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = currentFile.fileName;
                  a.click();
                  URL.revokeObjectURL(blobUrl);
                } catch (err) {
                  console.error("Download error", err);
                }
              }}
              disabled={!currentFile.signedUrl}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-1 grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          {contentLoading && needsLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            </div>
          )}

          {isImage && currentFile.signedUrl && (
            <div
              ref={scrollContainerRef}
              className="flex h-full items-center justify-center overflow-auto p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentFile.signedUrl}
                alt={currentFile.fileName}
                className="max-h-full max-w-full object-contain"
                onLoad={handleContentLoaded}
                onError={handleContentLoaded}
              />
            </div>
          )}

          {isPdf && currentFile.signedUrl && (
            <iframe
              key={currentFile.id}
              ref={iframeRef}
              src={`${currentFile.signedUrl}#page=1`}
              className="absolute inset-0 h-full w-full border-0"
              title={currentFile.fileName}
              onLoad={handleContentLoaded}
            />
          )}

          {isOffice && googleViewerUrl && (
            <iframe
              key={currentFile.id}
              ref={iframeRef}
              src={googleViewerUrl}
              className="absolute inset-0 h-full w-full border-0"
              title={currentFile.fileName}
              onLoad={handleContentLoaded}
            />
          )}

          {!isImage && !isPdf && !isOffice && (
            <div
              ref={scrollContainerRef}
              className="h-full overflow-auto"
            >
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <FileIcon className="h-16 w-16 text-slate-600" />
              <div>
                <p className="text-[13px] text-slate-400">
                  Preview not available for{" "}
                  <code className="text-slate-500">{currentFile.mimeType}</code>
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Download the file to view it locally
                </p>
                {currentFile.signedUrl && (
                  <a
                    href={currentFile.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                  </a>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
