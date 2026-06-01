"use server";

import type { FilesStorageFilters, FilesStorageReport } from "../types";
import { DEFAULT_FILES_STORAGE_FILTERS } from "../types";
import { FILES_STORAGE_MOCK } from "../mock-data";

export async function getFilesStorageReport(
  _filters: FilesStorageFilters = DEFAULT_FILES_STORAGE_FILTERS,
): Promise<FilesStorageReport> {
  return FILES_STORAGE_MOCK;
}
