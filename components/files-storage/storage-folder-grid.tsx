import StorageFolderCard from "./storage-folder-card";
import type { StorageFolder } from "@/lib/files-storage/types";

type Props = {
  folders: StorageFolder[];
  onFolderClick?: (bucket: string) => void;
};

export default function StorageFolderGrid({ folders, onFolderClick }: Props) {
  if (folders.length === 0) {
    return (
      <div className="rounded-sm border border-slate-700/80 bg-[#0a101c]/40 px-4 py-12 text-center text-[12px] text-slate-500">
        No folders match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {folders.map((folder) => (
        <StorageFolderCard
          key={folder.id}
          folder={folder}
          onClick={onFolderClick ? () => onFolderClick(folder.id) : undefined}
        />
      ))}
    </div>
  );
}
