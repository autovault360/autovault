"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, CheckCircle, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { KPI_CARD_DEFAULT_PROPS, KPI_CARD_SHELL_CLASS, kpiGridClass } from "@/lib/ui/kpi-grid";
import FileTypeIcon from "@/components/files-storage/file-type-icon";
import DocumentViewerModal from "@/components/files-storage/document-viewer-modal";
import { getNormalizedFileType } from "@/lib/files-storage/file-type-utils";
import type { FilingPeriodDetail, FilingStatus } from "@/lib/tax-filing/types";
import type { FolderFileDetail, RecentUploadFileType } from "@/lib/files-storage/types";
import { updateFilingStatusAction } from "@/lib/tax-filing/server/update-filing-status";
import {
  uploadFilingDocument,
  deleteFilingDocument,
} from "@/lib/tax-filing/server/upload-filing-document";
import { cn } from "@/lib/utils";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

const statusColors: Record<string, string> = {
  open: "border-slate-600 bg-slate-600/10 text-slate-300",
  due: "border-amber-500 bg-amber-500/10 text-amber-300",
  paid: "border-blue-500 bg-blue-500/10 text-blue-300",
  filed: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  closed: "border-slate-500 bg-slate-500/10 text-slate-400",
};

const nextStatus: Record<string, FilingStatus | null> = {
  open: "due",
  due: "paid",
  paid: "filed",
  filed: "closed",
  closed: null,
};

const STATUS_LIFECYCLE: FilingStatus[] = ["open", "due", "paid", "filed", "closed"];

function toFileType(fileName: string): RecentUploadFileType {
  const normalized = getNormalizedFileType("", fileName);
  if (normalized === "png" || normalized === "webp" || normalized === "jpg") return "jpg";
  if (normalized === "pdf" || normalized === "xlsx" || normalized === "mp4") return normalized;
  return "other";
}

type Props = {
  detail: FilingPeriodDetail;
};

export default function FilingPeriodDetailPage({ detail }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(detail.status);
  const [documents, setDocuments] = useState(detail.documents);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewerFile, setViewerFile] = useState<FolderFileDetail | null>(null);

  const kpiCards: KPICardData[] = useMemo(() => [
    {
      icon: "landmark",
      color: "blue",
      label: "Due Date",
      value: new Date(detail.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "0,0",
    },
    {
      icon: "car",
      color: "green",
      label: "Vehicles in Filing",
      value: String(detail.vehicles.length),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,0",
    },
    {
      icon: "dollar-sign",
      color: "violet",
      label: "Total Tax Entered",
      value: fmt(detail.totalTaxEntered),
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: "0,0",
    },
  ], [detail]);

  const folderFiles: FolderFileDetail[] = useMemo(
    () => documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      storagePath: d.filePath,
      fileSize: 0,
      mimeType: "",
      fileType: toFileType(d.fileName),
      uploadedAt: d.uploadedAt,
      uploadedBy: "",
      sourceEntity: null,
      sourceEntityId: null,
      sourceEntityName: null,
      signedUrl: d.signedUrl,
    })),
    [documents],
  );

  const handleFileDrop = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadFilingDocument(detail.id, file.name, file);
      if (result.success) {
        setDocuments((prev) => [
          ...prev,
          {
            id: result.documentId,
            fileName: file.name,
            filePath: `${detail.id}/${file.name}`,
            uploadedAt: new Date().toISOString(),
            signedUrl: null,
          },
        ]);
        toast.success("Document uploaded successfully.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to upload document.");
      }
    } catch {
      toast.error("Failed to upload document.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [detail.id, router]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
  }, [handleFileDrop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileDrop(dropped);
  }, [handleFileDrop]);

  const handleDelete = useCallback(async (documentId: string) => {
    const result = await deleteFilingDocument(documentId);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      toast.success("Document deleted.");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete document.");
    }
  }, [router]);

  const handlePreview = useCallback((doc: (typeof documents)[0]) => {
    if (!doc.signedUrl) return;
    setViewerFile({
      id: doc.id,
      fileName: doc.fileName,
      storagePath: doc.filePath,
      fileSize: 0,
      mimeType: "",
      fileType: toFileType(doc.fileName),
      uploadedAt: doc.uploadedAt,
      uploadedBy: "",
      sourceEntity: null,
      sourceEntityId: null,
      sourceEntityName: null,
      signedUrl: doc.signedUrl,
    });
  }, []);

  const handleStatusUpdate = useCallback(async (targetStatus: FilingStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateFilingStatusAction({
        periodId: detail.id,
        status: targetStatus,
      });
      if (result.success) {
        setStatus(targetStatus);
        toast.success(`Status updated to "${targetStatus}".`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update status.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  }, [detail.id, router]);

  const currentIdx = STATUS_LIFECYCLE.indexOf(status);
  const allowedNext = currentIdx < STATUS_LIFECYCLE.length - 1
    ? STATUS_LIFECYCLE.slice(currentIdx + 1)
    : [];

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/state-tax"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-400 hover:text-blue-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Tax Center
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{detail.name}</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            {new Date(detail.startDate).toLocaleDateString("en-US", {
              month: "long", day: "numeric",
            })}
            {" �€” "}
            {new Date(detail.endDate).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`rounded border px-3 py-1 text-[11px] font-semibold uppercase ${statusColors[status] ?? statusColors.open}`}
        >
          {status}
        </span>
      </div>

      <section className={kpiGridClass(kpiCards.length)}>
        {kpiCards.map((card) => (
          <KPICard
            key={card.label}
            data={card}
            {...KPI_CARD_DEFAULT_PROPS}
            className={KPI_CARD_SHELL_CLASS}
          />
        ))}
      </section>

      <Card className="rounded-sm border border-slate-700 bg-card p-4 shadow-none">
        <h3 className="mb-3 text-[13px] font-semibold text-white">Filing Status</h3>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_LIFECYCLE.map((s, idx) => {
            const isCurrent = s === status;
            const isPast = idx < currentIdx;
            const isAvailable = idx > currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                {idx > 0 && (
                  <div className={cn(
                    "h-px w-4",
                    isPast || isCurrent ? "bg-emerald-500/50" : "bg-slate-700",
                  )} />
                )}
                <button
                  type="button"
                  disabled={!isAvailable || isUpdating}
                  onClick={() => handleStatusUpdate(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase transition-colors",
                    isCurrent
                      ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50"
                      : isPast
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-slate-800/50 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300",
                  )}
                >
                  {isPast && <CheckCircle className="h-3 w-3" />}
                  {s}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {allowedNext.length > 0
            ? `Click a status to advance. Recommended order: open �†’ due �†’ paid �†’ filed �†’ closed.`
            : "This period has reached its final status."}
        </p>
      </Card>

      <Card className="rounded-sm border border-blue-500/25 bg-blue-500/10 p-3 shadow-none">
        <p className="text-[12px] leading-relaxed text-blue-200/80">
          <span className="font-semibold text-blue-300">Important:</span> Total
          tax due is based on sales tax amounts entered by the dealer in each
          Deal Jacket. AutoVault does not calculate, verify, or guarantee tax
          amounts. The dealer is responsible for accurate tax reporting.
        </p>
      </Card>

      <Card className="rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
        <h2 className="mb-3 text-[13px] font-bold text-white">Vehicles</h2>
        {detail.vehicles.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-500">
            No vehicles have been assigned to this filing period yet. Vehicles
            are automatically linked when a Deal Jacket is completed.
          </p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Vehicle", "VIN", "Customer", "Sold Date", "Buyer ZIP", "Sale Price", "Sales Tax Entered", ""].map((col) => (
                    <th key={col}
                      className={`pb-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500 ${col === "Sale Price" || col === "Sales Tax Entered" ? "text-right" : "text-left"}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.vehicles.map((v) => (
                  <tr key={v.dealJacketId} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-2.5 text-[11.5px] font-medium text-white">{v.vehicleTitle}</td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-400">{v.vin}</td>
                    <td className="py-2.5 text-[11.5px] text-slate-300">{v.customerName}</td>
                    <td className="py-2.5 text-[11.5px] text-slate-300">{v.soldDate}</td>
                    <td className="py-2.5 text-[11.5px] text-slate-300">{v.buyerZip}</td>
                    <td className="py-2.5 text-right text-[11.5px] text-slate-300">{fmt(v.salePrice)}</td>
                    <td className="py-2.5 text-right text-[11.5px] font-medium text-slate-200">{fmt(v.salesTaxEntered)}</td>
                    <td className="py-2.5">
                      <Link href={`/dashboard/deal-jackets/${v.dealJacketId}`}
                        className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
                      >
                        View Deal
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-bold text-white">Documents</h2>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={handleUploadClick}
          onKeyDown={(e) => e.key === "Enter" && handleUploadClick()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors",
            dragOver
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-slate-700/80 bg-[#070c14]/50 hover:border-slate-600",
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-10 w-10 animate-spin text-emerald-400" />
              <p className="text-center text-[12px] text-slate-400">Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud className="mb-2 h-10 w-10 text-emerald-500" />
              <p className="text-center text-[12px] text-slate-400">
                Drag and drop your file here or
              </p>
              <Button type="button" theme="dark" variant="outline" size="sm"
                className="mt-3 border-slate-600 bg-[#0a101c] text-[11px] text-slate-200 hover:bg-slate-800"
                onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
              >
                Choose File
              </Button>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-500">
                Supported: PDF, JPG, PNG (Max 20MB)
              </p>
            </>
          )}
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
          />
        </div>

        {documents.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {documents.map((doc) => (
              <div key={doc.id}
                className="flex items-center gap-3 rounded-sm border border-slate-700/50 bg-transparent px-3 py-2.5 transition hover:border-slate-600 hover:bg-slate-800/20"
              >
                <button
                  type="button"
                  onClick={() => handlePreview(doc)}
                  disabled={!doc.signedUrl}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileTypeIcon fileType={toFileType(doc.fileName)} className="h-7 w-7 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-white">{doc.fileName}</div>
                    <div className="text-[10px] text-slate-500">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="outline" size="icon-sm"
                    className="h-7 w-7 border-slate-700 text-slate-400"
                    aria-label="Preview document"
                    disabled={!doc.signedUrl}
                    onClick={() => handlePreview(doc)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <button type="button" onClick={() => handleDelete(doc.id)}
                    className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && !isUploading && (
          <p className="mt-4 text-center text-[12px] text-slate-500">
            No documents uploaded yet.
          </p>
        )}
      </Card>

      <DocumentViewerModal
        file={viewerFile}
        files={folderFiles}
        open={!!viewerFile}
        onOpenChange={(open) => { if (!open) setViewerFile(null); }}
      />
    </div>
  );
}
