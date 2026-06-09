"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { filterFilesStorage } from "@/lib/files-storage/filter-files-storage";
import type {
  FilesStorageFilters,
  FilesStorageReport,
  RecentUpload,
} from "@/lib/files-storage/types";
import { DEFAULT_FILES_STORAGE_FILTERS } from "@/lib/files-storage/types";
import type { PortalModuleOptions } from "@/lib/portal/module-options";
import { resolvePortalModuleOptions } from "@/lib/portal/module-options";
import FilesStorageHeader from "./files-storage-header";
import StorageOverviewCards from "./storage-overview-cards";
import StorageUsageCard from "./storage-usage-card";
import FilesStorageFoldersSection from "./files-storage-folders-section";
import FilesStorageUpload from "./files-storage-upload";
import StorageTipsCard from "./storage-tips-card";
import FilesStorageAIAssistant from "./files-storage-ai-assistant";

type Props = PortalModuleOptions & {
  initialReport: FilesStorageReport;
};

export default function FilesStoragePageContent({
  initialReport,
  readOnly,
  showAdminHeader,
}: Props) {
  const { readOnly: isReadOnly, showAdminHeader: showHeader } =
    resolvePortalModuleOptions({ readOnly, showAdminHeader });
  const [filters, setFilters] = useState<FilesStorageFilters>(
    DEFAULT_FILES_STORAGE_FILTERS,
  );
  const [report, setReport] = useState<FilesStorageReport>(initialReport);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const filtered = useMemo(
    () => filterFilesStorage(filters, report),
    [filters, report],
  );

  const handleDateChange = useCallback((asOfDate: string) => {
    setFilters((prev) => ({ ...prev, asOfDate }));
  }, []);

  const handleFolderSearchChange = useCallback((folderSearch: string) => {
    setFilters((prev) => ({ ...prev, folderSearch }));
  }, []);

  const handleViewModeChange = useCallback(
    (viewMode: FilesStorageFilters["viewMode"]) => {
      setFilters((prev) => ({ ...prev, viewMode }));
    },
    [],
  );

  const handleUpload = useCallback((upload: RecentUpload) => {
    setReport((prev) => ({
      ...prev,
      recentUploads: [upload, ...prev.recentUploads].slice(0, 10),
      lastUpload: {
        at: upload.uploadedAt,
        by: "John Dealer",
      },
    }));
  }, []);

  return (
    <div className="files-storage-page relative">
      {showHeader && <AdminHeader />}

      <div className="flex gap-3.5">
        <div className="min-w-0 flex-1">
          <FilesStorageHeader
            asOfDate={filters.asOfDate}
            onDateChange={handleDateChange}
          />

          <StorageOverviewCards report={filtered.report} />

          <StorageUsageCard report={filtered.report} />

          <FilesStorageFoldersSection
            folders={filtered.folders}
            recentUploads={filtered.recentUploads}
            folderSearch={filters.folderSearch}
            viewMode={filters.viewMode}
            onFolderSearchChange={handleFolderSearchChange}
            onViewModeChange={handleViewModeChange}
          />

          <section
            className={`grid gap-3.5 ${isReadOnly ? "md:grid-cols-1" : "md:grid-cols-2"}`}
          >
            {!isReadOnly && (
              <FilesStorageUpload onUpload={handleUpload} />
            )}
            <StorageTipsCard
              usagePercent={filtered.report.usagePercent}
              tips={filtered.report.storageTips}
              breakdown={filtered.report.breakdown}
            />
          </section>
        </div>

        {aiPanelOpen && (
          <FilesStorageAIAssistant
            suggestions={report.aiSuggestions}
            open={aiPanelOpen}
            onOpenChange={setAiPanelOpen}
          />
        )}
      </div>

      {!aiPanelOpen && (
        <button
          type="button"
          onClick={() => setAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full border border-slate-700 bg-[#0c1424] px-4 text-[12px] font-medium text-blue-400 shadow-lg transition-colors hover:border-slate-600 hover:bg-slate-800"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </button>
      )}
    </div>
  );
}
