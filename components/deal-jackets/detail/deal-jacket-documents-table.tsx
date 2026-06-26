"use client";

import { useMemo, useState } from "react";
import { Download, Eye, Plus } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail, DealJacketFileItem } from "@/lib/deal-jackets/detail-types";
import type { FolderFileDetail } from "@/lib/files-storage/types";
import DocumentViewerModal from "@/components/files-storage/document-viewer-modal";
import FileTypeIcon from "@/components/files-storage/file-type-icon";
import {
  downloadDealJacketFile,
  mapDealJacketFileToFolderDetail,
  toRecentUploadFileType,
} from "@/lib/deal-jackets/map-deal-jacket-file";
import { Button } from "@/components/ui/button";
import {
  DetailCard,
  DetailCardBody,
  DetailCardHead,
} from "./detail-primitives";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border-0 [&>div]:bg-transparent " +
  "[&_table]:min-w-[720px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-[var(--bg-primary)]/40 [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:bg-transparent [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/20";

type DocumentRow = DealJacketFileItem & {
  documentType: string;
  uploadedBy: string;
};

function inferDocumentType(name: string, type: DealJacketFileItem["type"]): string {
  const lower = name.toLowerCase();
  if (lower.includes("title")) return "Title";
  if (lower.includes("bill of sale") || lower.includes("bos")) return "Bill of Sale";
  if (lower.includes("buyer")) return "Buyer's Order";
  if (lower.includes("license") || lower.includes("driver")) return "ID";
  if (lower.includes("insurance")) return "Insurance";
  if (lower.includes("receipt")) return "Receipt";
  if (lower.includes("contract") || lower.includes("agreement")) return "Contract";
  if (type === "receipt") return "Receipt";
  return "Document";
}

export default function DealJacketDocumentsTable({
  detail,
}: {
  detail: DealJacketDetail;
}) {
  const [viewerFile, setViewerFile] = useState<FolderFileDetail | null>(null);

  const rows = useMemo<DocumentRow[]>(
    () =>
      [...detail.documents, ...detail.receipts].map((doc) => ({
        ...doc,
        documentType: inferDocumentType(doc.name, doc.type),
        uploadedBy: detail.salesRep.name,
      })),
    [detail.documents, detail.receipts, detail.salesRep.name],
  );

  const folderFiles = useMemo(
    () => rows.map(mapDealJacketFileToFolderDetail),
    [rows],
  );

  const handlePreview = (doc: DealJacketFileItem) => {
    if (!doc.fileUrl) return;
    setViewerFile(mapDealJacketFileToFolderDetail(doc));
  };

  const columns: Column<DocumentRow>[] = [
    {
      key: "name",
      header: "Document Name",
      sortable: true,
      accessor: (row) => row.name,
      cell: (row) => (
        <button
          type="button"
          onClick={() => handlePreview(row)}
          disabled={!row.fileUrl}
          className="flex min-w-[180px] items-center gap-2.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileTypeIcon
            fileType={toRecentUploadFileType(row.fileType, row.name)}
            className="h-7 w-7"
          />
          <span className="truncate text-[11.5px] font-medium text-white">
            {row.name}
          </span>
        </button>
      ),
    },
    {
      key: "documentType",
      header: "Type",
      sortable: true,
      accessor: (row) => row.documentType,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">{row.documentType}</span>
      ),
    },
    {
      key: "uploadedBy",
      header: "Uploaded By",
      sortable: true,
      accessor: (row) => row.uploadedBy,
      cell: (row) => (
        <span className="text-[11px] text-slate-300">{row.uploadedBy}</span>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded On",
      sortable: true,
      accessor: (row) => row.uploadedAt,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] text-slate-400">
          {formatDisplayDate(row.uploadedAt)}
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
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-7 w-7 border-slate-700 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            aria-label="View document"
            disabled={!row.fileUrl}
            onClick={() => handlePreview(row)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-7 w-7 border-slate-700 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            aria-label="Download document"
            disabled={!row.fileUrl}
            onClick={() => downloadDealJacketFile(row)}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DetailCard className="h-full bg-card">
        <DetailCardHead
          title="Documents"
          action={
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Document
            </Button>
          }
        />
        <DetailCardBody className="px-0 pb-0">
          <div className={TABLE_WRAPPER_CLASS}>
            <DataTable
              columns={columns}
              data={rows}
              rowKey="id"
              pageSize={8}
              addPagination
              paginationSummaryLabel="documents"
              emptyMessage="No documents uploaded yet."
            />
          </div>
        </DetailCardBody>
      </DetailCard>

      <DocumentViewerModal
        file={viewerFile}
        files={folderFiles}
        open={!!viewerFile}
        onOpenChange={(open) => {
          if (!open) setViewerFile(null);
        }}
      />
    </>
  );
}
