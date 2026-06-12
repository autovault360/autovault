import FilesStoragePageContent from "@/components/files-storage/files-storage-page-content";
import { getFilesStorageReport } from "@/lib/files-storage/server/get-files-storage-report";
import { DEFAULT_FILES_STORAGE_FILTERS } from "@/lib/files-storage/types";

export default async function FilesStoragePage() {
  const initialReport = await getFilesStorageReport(DEFAULT_FILES_STORAGE_FILTERS);

  return <FilesStoragePageContent initialReport={initialReport} showAdminHeader={false} />;
}
