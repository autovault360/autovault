import type {
  FilesStorageFilters,
  FilesStorageReport,
  StorageFolder,
} from "./types";

export type FilteredFilesStorage = {
  folders: StorageFolder[];
  recentUploads: FilesStorageReport["recentUploads"];
  report: FilesStorageReport;
};

export function filterFilesStorage(
  filters: FilesStorageFilters,
  report: FilesStorageReport,
): FilteredFilesStorage {
  const q = filters.folderSearch.toLowerCase().trim();

  const folders = q
    ? report.folders.filter(
        (folder) =>
          folder.name.toLowerCase().includes(q) ||
          folder.description.toLowerCase().includes(q),
      )
    : report.folders;

  return {
    folders,
    recentUploads: report.recentUploads,
    report,
  };
}
