"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { formatFileSize } from "@/lib/files-storage/file-type-utils";
import { formatUploadTime } from "@/lib/files-storage/format-utils";
import FileTypeIcon from "./file-type-icon";
import DocumentViewerModal from "./document-viewer-modal";
import { getFolderFilesAction } from "@/lib/files-storage/server/actions";
import type { FolderFileDetail } from "@/lib/files-storage/types";

const folderNameMap: Record<string, string> = {
  "vehicle-images": "Vehicle Photos",
  "vehicle-documents": "Vehicle Documents",
  "customer-images": "Customer Images",
  "user-images": "User Avatars",
  "expense-receipts": "Expenses & Receipts",
  "deal-jacket-documents": "Deal Jackets",
};

const entityLinkMap: Record<string, (id: string) => string> = {
  vehicle: (id) => `/dashboard/vehicles/${id}`,
  customer: (id) => `/dashboard/customers/${id}`,
  deal: (id) => `/dashboard/deal-jackets/${id}`,
  deal_jacket: (id) => `/dashboard/deal-jackets/${id}`,
};

type Props = {
  bucket: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FolderFilesModal({ bucket, open, onOpenChange }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<FolderFileDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewerFile, setViewerFile] = useState<FolderFileDetail | null>(null);

  useEffect(() => {
    if (!open || !bucket) return;

    setLoading(true);
    setError(null);
    setSearch("");
    setViewerFile(null);

    getFolderFilesAction(bucket)
      .then((data) => {
        setFiles(data);
        if (data.length === 0) setError("No files found in this folder.");
      })
      .catch(() => setError("Failed to load files."))
      .finally(() => setLoading(false));
  }, [open, bucket]);

  const filtered = useMemo(
    () => {
      if (!search.trim()) return files;
      const q = search.toLowerCase();
      return files.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          (f.sourceEntityName?.toLowerCase().includes(q)) ||
          (f.uploadedBy?.toLowerCase().includes(q)),
      );
    },
    [files, search],
  );

  const handleEntityClick = useCallback(
    (entity: string | null, id: string | null) => {
      if (!entity || !id) return;
      const linkBuilder = entityLinkMap[entity];
      if (!linkBuilder) return;
      onOpenChange(false);
      router.push(linkBuilder(id));
    },
    [router, onOpenChange],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl border-slate-700 bg-[#0c1424] text-white">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-white">
              {bucket ? (folderNameMap[bucket] ?? bucket) : "Folder"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <InputGroup className="h-8 flex-1 border-slate-700 bg-[#0a101c]/60">
              <InputGroupAddon>
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </InputGroupAddon>
              <InputGroupInput
                theme="dark"
                placeholder="Search by name, linked record, or uploader..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[11.5px]"
              />
            </InputGroup>
            <span className="whitespace-nowrap text-[13px] text-slate-500">
              {filtered.length} / {files.length} files
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-sm border border-slate-700/80 bg-[#0a101c]/40">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : error && files.length === 0 ? (
              <p className="py-12 text-center text-[12px] text-slate-500">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-[12px] text-slate-500">
                {search ? "No files match your search." : "No files in this folder."}
              </p>
            ) : (
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0c1424]">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Size
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Uploaded
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Linked To
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Uploaded By
                    </th>
                    <th className="w-10 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((file) => (
                    <tr
                      key={file.id}
                      data-file-id={file.id}
                      className="border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/25"
                    >
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setViewerFile(file)}
                          className="flex w-full items-center gap-2.5 text-left"
                        >
                          <FileTypeIcon fileType={file.fileType} className="h-7 w-7 shrink-0" />
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-medium text-white transition-colors group-hover:text-blue-400">
                              {file.fileName}
                            </div>
                            <div className="text-[10px] text-slate-500">{file.mimeType}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-300">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-300">
                        {formatUploadTime(file.uploadedAt)}
                      </td>
                      <td className="px-3 py-3">
                        {file.sourceEntity && file.sourceEntityId && entityLinkMap[file.sourceEntity] ? (
                          <button
                            type="button"
                            onClick={() => handleEntityClick(file.sourceEntity, file.sourceEntityId)}
                            className="group text-left"
                          >
                            <div className="text-[12px] text-blue-400 transition-colors hover:text-blue-300">
                              {file.sourceEntityName ?? (
                                <span className="text-slate-400">
                                  {file.sourceEntityId.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                              {file.sourceEntity.replace(/_/g, " ")}
                            </div>
                          </button>
                        ) : (
                          <>
                            <div className="text-[12px] text-slate-300">
                              {file.sourceEntityName ?? (
                                <span className="text-slate-600">...</span>
                              )}
                            </div>
                            {file.sourceEntity && (
                              <div className="text-[10px] text-slate-500">
                                {file.sourceEntity.replace(/_/g, " ")}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-300">
                        {file.uploadedBy}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setViewerFile(file)}
                          disabled={!file.signedUrl}
                          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-800 hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                          title="Preview file"
                        >
                          {file.signedUrl ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DocumentViewerModal
        file={viewerFile}
        files={files}
        open={!!viewerFile}
        onOpenChange={(open) => { if (!open) setViewerFile(null); }}
      />
    </>
  );
}
