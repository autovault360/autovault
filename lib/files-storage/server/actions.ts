"use server";

import type { FilesStorageFilters, FilesStorageReport } from "../types";
import { getFilesStorageReport } from "./get-files-storage-report";

export async function fetchFilesStorageReportAction(
  filters: FilesStorageFilters,
): Promise<FilesStorageReport> {
  return getFilesStorageReport(filters);
}
