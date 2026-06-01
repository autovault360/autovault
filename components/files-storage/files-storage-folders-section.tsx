"use client";

import { Search, LayoutGrid, LayoutList } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import FilesStorageTable from "./files-storage-table";
import StorageFolderGrid from "./storage-folder-grid";
import FilesStorageRecentUploads from "./files-storage-recent-uploads";
import type {
  FilesStorageViewMode,
  RecentUpload,
  StorageFolder,
} from "@/lib/files-storage/types";

type Props = {
  folders: StorageFolder[];
  recentUploads: RecentUpload[];
  folderSearch: string;
  viewMode: FilesStorageViewMode;
  onFolderSearchChange: (value: string) => void;
  onViewModeChange: (mode: FilesStorageViewMode) => void;
};

export default function FilesStorageFoldersSection({
  folders,
  recentUploads,
  folderSearch,
  viewMode,
  onFolderSearchChange,
  onViewModeChange,
}: Props) {
  return (
    <section className="mb-3.5 grid gap-3.5 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">
      <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Folders
          </h2>
          <div className="flex items-center gap-2">
            <InputGroup className="h-8 w-[180px] border-slate-700 bg-[#0a101c]/60">
              <InputGroupAddon>
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </InputGroupAddon>
              <InputGroupInput
                theme="dark"
                placeholder="Search folders..."
                value={folderSearch}
                onChange={(e) => onFolderSearchChange(e.target.value)}
                className="text-[11.5px]"
              />
            </InputGroup>
            <div className="flex rounded-md border border-slate-700">
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "grid h-8 w-8 place-items-center transition-colors",
                  viewMode === "list"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-300",
                )}
                aria-label="List view"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "grid h-8 w-8 place-items-center border-l border-slate-700 transition-colors",
                  viewMode === "grid"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-300",
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <FilesStorageTable folders={folders} />
        ) : (
          <StorageFolderGrid folders={folders} />
        )}
      </Card>

      <FilesStorageRecentUploads uploads={recentUploads} />
    </section>
  );
}
