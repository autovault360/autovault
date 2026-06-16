"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Shuffle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import FileTypeIcon from "@/components/files-storage/file-type-icon";
import DocumentViewerModal from "@/components/files-storage/document-viewer-modal";
import EntityActionModal from "@/components/shared/entity-action-modal";
import { cn } from "@/lib/utils";
import {
  WHOLESALE_DOCUMENT_CATEGORY_COLORS,
  WHOLESALE_DOCUMENT_CATEGORY_LABELS,
  WHOLESALE_DOCUMENT_STATUS_LABELS,
} from "@/lib/dealer/documents/constants";
import {
  deleteWholesaleDocument,
  getWholesaleDocumentSignedUrl,
  restoreWholesaleDocument,
  updateWholesaleDocumentStatus,
} from "@/lib/dealer/documents/server/document-actions";
import {
  formatDocumentDateTime,
  formatDocumentFileSize,
  type WholesaleDocument,
} from "@/lib/dealer/documents/types";
import { mimeToFileType, wholesaleDocumentToViewerFile } from "@/lib/dealer/documents/viewer-utils";
import EditDocumentModal from "./edit-document-modal";
import ReplaceFileModal from "./replace-file-modal";
import DocumentsPagination from "./documents-pagination";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent " +
  "[&_table]:min-w-[980px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0a101c]/60 [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-3 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/20";

function getVehicleDisplayName(vehicle: NonNullable<WholesaleDocument["vehicle"]>) {
  const base = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return vehicle.trim ? `${base} ${vehicle.trim}` : base;
}

type Props = {
  documents: WholesaleDocument[];
  loading?: boolean;
  onRefresh: () => void;
  showDeleted?: boolean;
};

export default function DocumentsTable({
  documents,
  loading,
  onRefresh,
  showDeleted,
}: Props) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [editDoc, setEditDoc] = useState<WholesaleDocument | null>(null);
  const [replaceDoc, setReplaceDoc] = useState<WholesaleDocument | null>(null);
  const [statusDoc, setStatusDoc] = useState<WholesaleDocument | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<WholesaleDocument | null>(null);
  const [viewerFiles, setViewerFiles] = useState<ReturnType<typeof wholesaleDocumentToViewerFile>[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!activePopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePopover]);

  const openViewer = async (doc: WholesaleDocument) => {
    const result = await getWholesaleDocumentSignedUrl(doc.id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const file = wholesaleDocumentToViewerFile(doc, result.url);
    setViewerDoc(doc);
    setViewerFiles([file]);
    setViewerOpen(true);
    setActivePopover(null);
  };

  const handleDownload = async (doc: WholesaleDocument) => {
    const result = await getWholesaleDocumentSignedUrl(doc.id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    setActivePopover(null);
  };

  const handleDelete = async (doc: WholesaleDocument) => {
    const result = await deleteWholesaleDocument(doc.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Document deleted.");
    setActivePopover(null);
    onRefresh();
  };

  const handleRestore = async (doc: WholesaleDocument) => {
    const result = await restoreWholesaleDocument(doc.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Document restored.");
    setActivePopover(null);
    onRefresh();
  };

  const columns: Column<WholesaleDocument>[] = useMemo(
    () => [
      {
        key: "documentName",
        header: "Document Name",
        cell: (row) => (
          <div className="flex min-w-[160px] items-center gap-2.5">
            <FileTypeIcon
              fileType={mimeToFileType(row.mimeType, row.originalFileName)}
              className="h-7 w-7"
            />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-white">
                {row.documentName}
              </div>
              <div className="truncate text-[10px] text-slate-500">{row.originalFileName}</div>
            </div>
          </div>
        ),
      },
      {
        key: "vehicle",
        header: "Vehicle / VIN",
        cell: (row) =>
          row.vehicle ? (
            <div className="flex min-w-[180px] items-center gap-2.5">
              <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md bg-slate-800">
                {row.vehicle.imageUrl ? (
                  <Image
                    src={row.vehicle.imageUrl}
                    alt={getVehicleDisplayName(row.vehicle)}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-slate-500">
                    No Photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[11.5px] font-semibold text-white">
                  {getVehicleDisplayName(row.vehicle)}
                </div>
                <div className="truncate text-[10px] text-emerald-400">{row.vehicle.vin}</div>
                <div className="truncate text-[10px] text-slate-500">
                  Stock #{row.vehicle.stockNumber}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">-</span>
          ),
      },
      {
        key: "category",
        header: "Document Type",
        cell: (row) => (
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
              WHOLESALE_DOCUMENT_CATEGORY_COLORS[row.category],
            )}
          >
            {WHOLESALE_DOCUMENT_CATEGORY_LABELS[row.category]}
          </span>
        ),
      },
      {
        key: "uploadedBy",
        header: "Uploaded By",
        cell: (row) => (
          <span className="whitespace-nowrap text-[11.5px] text-slate-300">
            {row.uploadedByName}
          </span>
        ),
      },
      {
        key: "uploadDate",
        header: "Date & Time",
        cell: (row) => (
          <span className="whitespace-nowrap text-[11px] text-slate-400">
            {formatDocumentDateTime(row.uploadDate)}
          </span>
        ),
      },
      {
        key: "fileSize",
        header: "Size",
        cell: (row) => (
          <span className="text-[11px] text-slate-400">
            {formatDocumentFileSize(row.fileSize)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        headerClassName: "text-right",
        cellClassName: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openViewer(row)}
              className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="View document"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDownload(row)}
              className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Download document"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === row.id ? null : row.id)}
                className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {activePopover === row.id && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-slate-700 bg-[#0c1424] py-1 shadow-lg"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-slate-300 hover:bg-slate-800"
                    onClick={() => {
                      setEditDoc(row);
                      setActivePopover(null);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {!showDeleted && (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-slate-300 hover:bg-slate-800"
                        onClick={() => {
                          setReplaceDoc(row);
                          setActivePopover(null);
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Replace File
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-slate-300 hover:bg-slate-800"
                        onClick={() => {
                          setStatusDoc(row);
                          setActivePopover(null);
                        }}
                      >
                        <Shuffle className="h-3.5 w-3.5" /> Change Status
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-red-400 hover:bg-slate-800"
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                  {showDeleted && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-emerald-400 hover:bg-slate-800"
                      onClick={() => handleRestore(row)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Restore
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [activePopover, showDeleted],
  );

  return (
    <>
      <div className={TABLE_WRAPPER_CLASS}>
        <DataTable
          columns={columns}
          data={documents}
          rowKey="id"
          loading={loading}
          addPagination={true}
          emptyMessage={
            showDeleted
              ? "No deleted documents found."
              : "No documents match your filters."
          }
          paginationSummaryLabel="documents"
        />
      </div>

      <EditDocumentModal
        open={!!editDoc}
        onOpenChange={(open) => !open && setEditDoc(null)}
        document={editDoc}
        onSuccess={onRefresh}
      />

      <ReplaceFileModal
        open={!!replaceDoc}
        onOpenChange={(open) => !open && setReplaceDoc(null)}
        document={replaceDoc}
        onSuccess={onRefresh}
      />

      <EntityActionModal
        open={!!statusDoc}
        onOpenChange={(open) => !open && setStatusDoc(null)}
        title="Change Status"
        subtitle="Update the status of this document"
        sectionTitle="DOCUMENT STATUS"
        icon={<Shuffle className="h-4 w-4" />}
        fields={[
          {
            name: "status",
            label: "New Status",
            type: "select",
            required: true,
            defaultValue: statusDoc?.status ?? "active",
            options: Object.entries(WHOLESALE_DOCUMENT_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            name: "remarks",
            label: "Remarks (optional)",
            type: "textarea",
            defaultValue: statusDoc?.remarks ?? "",
          },
        ]}
        saveLabel="Update Status"
        isSubmitting={statusSubmitting}
        onSave={async (values) => {
          if (!statusDoc) return;
          setStatusSubmitting(true);
          try {
            const result = await updateWholesaleDocumentStatus(
              statusDoc.id,
              values.status as string,
              values.remarks as string | undefined,
            );
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("Status updated.");
            setStatusDoc(null);
            onRefresh();
          } finally {
            setStatusSubmitting(false);
          }
        }}
      />

      <DocumentViewerModal
        file={viewerDoc ? viewerFiles[0] ?? null : null}
        files={viewerFiles}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}
