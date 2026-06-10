import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatFileCount,
  formatLastModified,
  formatStorageGb,
} from "@/lib/files-storage/format-utils";
import type { StorageFolder, StorageFolderIconColor } from "@/lib/files-storage/types";

const iconBgMap: Record<StorageFolderIconColor, string> = {
  yellow: "bg-yellow-500/15",
  green: "bg-emerald-500/15",
  orange: "bg-orange-500/15",
  red: "bg-red-500/15",
  blue: "bg-blue-500/15",
  purple: "bg-purple-500/15",
};

type Props = {
  folder: StorageFolder;
  onClick?: () => void;
};

export default function StorageFolderCard({ folder, onClick }: Props) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "rounded-sm border border-slate-700 bg-card p-3.5 shadow-none transition-colors",
        onClick && "cursor-pointer hover:border-slate-600 hover:bg-slate-800/20",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-md",
              iconBgMap[folder.iconColor],
            )}
          >
            <Image
              src="/folder.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </div>
          {folder.pinned && (
            <Image
              src="/anchor.png"
              alt="Pinned"
              width={14}
              height={14}
              className="absolute -right-1 -top-1 h-3.5 w-3.5"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">
            {folder.name}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[13px] text-slate-500">
            {folder.description}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
            <span>{formatFileCount(folder.fileCount)} files</span>
            <span>{formatStorageGb(folder.sizeGb)}</span>
            <span>{formatLastModified(folder.lastModified)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
