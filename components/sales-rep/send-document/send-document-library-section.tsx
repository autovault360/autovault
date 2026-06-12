"use client";

import { useRef, useState } from "react";
import {
  Check,
  CloudUpload,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SEND_DOCUMENT_ALLOWED_EXTENSIONS } from "@/lib/sales-rep/send-document/constants";
import type { DocumentLibraryItem, SendDocumentFile } from "@/lib/sales-rep/send-document/types";
import { formatFileSize } from "@/lib/sales-rep/send-document/validation";
import { getSourceLabel } from "@/lib/sales-rep/send-document/source-labels";
import SendDocumentSectionCard from "./send-document-section-card";

const SOURCE_FILTERS = [
  { value: "all", label: "All Sources" },
  { value: "deal_jacket", label: "Deal Jacket" },
  { value: "customer", label: "Customer" },
  { value: "document_center", label: "Document Center" },
] as const;

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Images" },
] as const;

type Props = {
  libraryFiles: DocumentLibraryItem[];
  selectedFiles: SendDocumentFile[];
  loading: boolean;
  uploading: boolean;
  search: string;
  sourceFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onSourceFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onToggleSelect: (item: DocumentLibraryItem) => void;
  onRemoveSelected: (id: string) => void;
  onUpload: (files: FileList | File[]) => void;
};

export default function SendDocumentLibrarySection({
  libraryFiles,
  selectedFiles,
  loading,
  uploading,
  search,
  sourceFilter,
  typeFilter,
  onSearchChange,
  onSourceFilterChange,
  onTypeFilterChange,
  onToggleSelect,
  onRemoveSelected,
  onUpload,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const selectedIds = new Set(selectedFiles.map((file) => file.fileId ?? file.id));

  const accept = SEND_DOCUMENT_ALLOWED_EXTENSIONS.join(",");

  return (
    <SendDocumentSectionCard step={1} title="Select Document(s)">
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          theme="dark"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents..."
          className="h-10 border-slate-700 bg-slate-900/50 pl-9 text-[12px]"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SOURCE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onSourceFilterChange(filter.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[10.5px] font-medium transition",
              sourceFilter === filter.value
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                : "bg-slate-800/70 text-slate-400 hover:text-slate-200",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onTypeFilterChange(filter.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[10.5px] font-medium transition",
              typeFilter === filter.value
                ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30"
                : "bg-slate-800/70 text-slate-400 hover:text-slate-200",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="max-h-[280px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/20">
        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center gap-2 text-[12px] text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading documents...
          </div>
        ) : libraryFiles.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center px-4 text-center">
            <FileText className="mb-2 h-8 w-8 text-slate-600" />
            <p className="text-[11px] text-slate-500">
              No documents found. Upload a new document below.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {libraryFiles.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleSelect(item)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-800/40",
                      isSelected && "bg-violet-500/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded border",
                        isSelected
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-slate-600 bg-slate-900/60 text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-red-500/10 text-red-400">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-200">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {getSourceLabel(item.sourceEntity)} · {formatFileSize(item.size)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-wide text-slate-400">
              Selected Documents ({selectedFiles.length})
            </h3>
          </div>
          <ul className="space-y-2">
            {selectedFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
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
                  onClick={() => onRemoveSelected(file.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
        }}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 transition",
          dragOver
            ? "border-violet-500/60 bg-violet-500/5"
            : "border-slate-700 bg-slate-900/20 hover:border-violet-500/40 hover:bg-slate-900/40",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-7 w-7 animate-spin text-violet-400" />
            <p className="text-[11px] text-slate-400">Uploading document...</p>
          </>
        ) : (
          <>
            <CloudUpload className="mb-2 h-7 w-7 text-violet-400" />
            <p className="text-center text-[11px] text-slate-300">
              Upload new document to Document Center
            </p>
            <p className="mt-1 text-center text-[10px] text-slate-500">
              PDF, JPG, PNG, DOC, DOCX (Max 25MB)
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </SendDocumentSectionCard>
  );
}
