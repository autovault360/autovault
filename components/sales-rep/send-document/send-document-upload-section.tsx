"use client";

import { useRef, useState } from "react";
import { ChevronDown, CloudUpload, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEND_DOCUMENT_ALLOWED_EXTENSIONS } from "@/lib/sales-rep/send-document/constants";
import type {
  DocumentLibraryItem,
  SendDocumentFile,
} from "@/lib/sales-rep/send-document/types";
import { formatFileSize } from "@/lib/sales-rep/send-document/validation";
import { getSourceLabel } from "@/lib/sales-rep/send-document/source-labels";
import SendDocumentSectionCard from "./send-document-section-card";

type Props = {
  files: SendDocumentFile[];
  libraryFiles?: DocumentLibraryItem[];
  libraryLoading?: boolean;
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onToggleLibraryItem?: (item: DocumentLibraryItem) => void;
};

export default function SendDocumentUploadSection({
  files,
  libraryFiles = [],
  libraryLoading = false,
  onAddFiles,
  onRemoveFile,
  onToggleLibraryItem,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  const accept = SEND_DOCUMENT_ALLOWED_EXTENSIONS.join(",");
  const selectedLibraryIds = new Set(
    files.map((file) => file.fileId).filter((id): id is string => Boolean(id)),
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files);
  };

  return (
    <SendDocumentSectionCard step={2} title="Select Document(s)">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 transition",
          dragOver
            ? "border-violet-500/60 bg-violet-500/5"
            : "border-slate-700 bg-slate-900/20 hover:border-violet-500/40 hover:bg-slate-900/40",
        )}
      >
        <CloudUpload className="mb-3 h-9 w-9 text-violet-400" />
        <p className="text-center text-[12px] text-slate-300">
          Drag &amp; drop files here or{" "}
          <span className="font-medium text-violet-400">click to browse</span>
        </p>
        <p className="mt-2 text-center text-[10.5px] text-slate-500">
          PDF, JPG, PNG, DOC, DOCX (Max 25MB per file)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {onToggleLibraryItem && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/20">
          <button
            type="button"
            onClick={() => setBrowseOpen((open) => !open)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-slate-800/30"
          >
            <span className="text-[11px] font-semibold tracking-wide text-slate-400">
              Browse stored documents
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-500 transition",
                browseOpen && "rotate-180",
              )}
            />
          </button>

          {browseOpen && (
            <div className="border-t border-slate-800 px-3 pb-3">
              {libraryLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-[11px] text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading documents...
                </div>
              ) : libraryFiles.length === 0 ? (
                <p className="py-6 text-center text-[11px] text-slate-500">
                  No stored documents found.
                </p>
              ) : (
                <ul className="mt-2 max-h-[200px] space-y-1 overflow-y-auto">
                  {libraryFiles.map((item) => {
                    const isSelected = selectedLibraryIds.has(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onToggleLibraryItem(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                            isSelected
                              ? "border-violet-500/40 bg-violet-500/5"
                              : "border-slate-800 bg-slate-900/40 hover:border-slate-700",
                          )}
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-red-500/10 text-red-400">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-medium text-slate-200">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {getSourceLabel(item.sourceEntity)} ·{" "}
                              {formatFileSize(item.size)}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold text-violet-400">
                              Selected
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {files.length > 0 ? (
        <div className="mt-4">
          <h3 className="mb-2.5 text-[11px] font-semibold tracking-wide text-slate-400">
            Selected Documents ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-red-500/10 text-red-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-center text-[11px] text-slate-500">
          No documents selected. Upload at least one file to send.
        </p>
      )}
    </SendDocumentSectionCard>
  );
}
