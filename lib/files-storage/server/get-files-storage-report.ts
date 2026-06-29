"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getDealershipStorageReport, toFilesStorageReport } from "@/services/file-storage.service";
import type { FilesStorageFilters, FilesStorageReport } from "../types";
import { DEFAULT_FILES_STORAGE_FILTERS } from "../types";

export async function getFilesStorageReport(
  _filters: FilesStorageFilters = DEFAULT_FILES_STORAGE_FILTERS,
): Promise<FilesStorageReport> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) {
      return getEmptyReport();
    }

    const report = await getDealershipStorageReport(auth.user.dealershipId);
    return await toFilesStorageReport(report);
  } catch (err) {
    console.error("getFilesStorageReport failed:", err);
    return getEmptyReport();
  }
}

function getEmptyReport(): FilesStorageReport {
  return {
    totalStorageGb: 1024,
    usedStorageGb: 0,
    totalFiles: 0,
    totalImages: 0,
    lastUpload: { at: "", by: "" },
    usagePercent: 0,
    breakdown: [],
    folders: [],
    recentUploads: [],
    storageTips: [
      "Delete old or unused files to free up space",
      "Compress large video files before uploading",
      "Archive completed deal jackets regularly",
      "Review and clean up storage monthly",
    ],
    aiSuggestions: [
      { id: "sug-1", label: "Show me all deal jackets from this month", icon: "chart" },
      { id: "sug-2", label: "Which expenses are missing receipts?", icon: "clock" },
      { id: "sug-3", label: "Show me my top profitable vehicles", icon: "dollar" },
      { id: "sug-4", label: "What documents are missing in deal RO-1012?", icon: "file" },
      { id: "sug-5", label: "Show me pending CDTFA filings", icon: "image" },
      { id: "sug-6", label: "How much storage space do I have left?", icon: "cloud" },
    ],
  };
}
