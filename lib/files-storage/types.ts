export type FilesStorageViewMode = "list" | "grid";

export type FilesStorageFilters = {
  asOfDate: string;
  folderSearch: string;
  viewMode: FilesStorageViewMode;
};

export type StorageFolderIconColor =
  | "yellow"
  | "green"
  | "orange"
  | "red"
  | "blue"
  | "purple";

export type StorageFolder = {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  sizeGb: number;
  lastModified: string;
  iconColor: StorageFolderIconColor;
  pinned?: boolean;
};

export type RecentUploadFileType = "pdf" | "jpg" | "xlsx" | "mp4" | "other";

export type RecentUpload = {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: string;
  sizeBytes: number;
  fileType: RecentUploadFileType;
};

export type StorageBreakdownSegment = {
  id: string;
  label: string;
  color: string;
  sizeGb: number;
  percent: number;
};

export type AiSuggestionIcon =
  | "chart"
  | "clock"
  | "dollar"
  | "file"
  | "image"
  | "cloud"
  | "user"
  | "alert";

export type AiSuggestion = {
  id: string;
  label: string;
  icon: AiSuggestionIcon;
};

export type FilesStorageReport = {
  totalStorageGb: number;
  usedStorageGb: number;
  totalFiles: number;
  totalImages: number;
  lastUpload: { at: string; by: string };
  usagePercent: number;
  breakdown: StorageBreakdownSegment[];
  folders: StorageFolder[];
  recentUploads: RecentUpload[];
  storageTips: string[];
  aiSuggestions: AiSuggestion[];
};

export const DEFAULT_FILES_STORAGE_FILTERS: FilesStorageFilters = {
  asOfDate: "2025-05-20",
  folderSearch: "",
  viewMode: "list",
};
