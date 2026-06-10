import FilesStoragePageContent from "@/components/files-storage/files-storage-page-content";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getFilesStorageReport } from "@/lib/files-storage/server/get-files-storage-report";
import { DEFAULT_FILES_STORAGE_FILTERS } from "@/lib/files-storage/types";

export default async function CpaFilesPage() {
  const [session, initialReport] = await Promise.all([
    getCpaSession(),
    getFilesStorageReport(DEFAULT_FILES_STORAGE_FILTERS),
  ]);

  return (
    <>
      <FilesStoragePageContent
        initialReport={initialReport}
        readOnly={session?.isReadOnly ?? true}
        showAdminHeader={false}
      />
    </>
  );
}
