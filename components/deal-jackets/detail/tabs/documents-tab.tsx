"use client";

import { useState, useMemo } from "react";
import type { DealJacketDetail, DealJacketFileItem } from "@/lib/deal-jackets/detail-types";
import type { FolderFileDetail } from "@/lib/files-storage/types";
import DocumentViewerModal from "@/components/files-storage/document-viewer-modal";
import {
  downloadDealJacketFile,
  mapDealJacketFileToFolderDetail,
} from "@/lib/deal-jackets/map-deal-jacket-file";
import DealJacketDocumentListItem, {
  DealJacketDocumentsEmptyState,
} from "../deal-jacket-document-list-item";

export default function DocumentsTab({ detail }: { detail: DealJacketDetail }) {
  const [viewerFile, setViewerFile] = useState<FolderFileDetail | null>(null);

  const folderFiles = useMemo(
    () => detail.documents.map(mapDealJacketFileToFolderDetail),
    [detail.documents],
  );

  const handlePreview = (doc: DealJacketFileItem) => {
    if (!doc.fileUrl) return;
    setViewerFile(mapDealJacketFileToFolderDetail(doc));
  };

  if (detail.documents.length === 0) {
    return <DealJacketDocumentsEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {detail.documents.map((doc) => (
          <DealJacketDocumentListItem
            key={doc.id}
            doc={doc}
            onPreview={handlePreview}
            onDownload={downloadDealJacketFile}
          />
        ))}
      </div>

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
