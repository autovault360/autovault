"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { cn } from "@/lib/utils";
import {
  formatFileCount,
  formatLastModified,
  formatStorageGb,
} from "@/lib/files-storage/format-utils";
import type { StorageFolder, StorageFolderIconColor } from "@/lib/files-storage/types";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[640px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-3.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25";

const iconBgMap: Record<StorageFolderIconColor, string> = {
  yellow: "bg-yellow-500/15",
  green: "bg-emerald-500/15",
  orange: "bg-orange-500/15",
  red: "bg-red-500/15",
  blue: "bg-blue-500/15",
  purple: "bg-purple-500/15",
};

function FolderActionsMenu({ folderId }: { folderId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
        aria-label={`Actions for folder ${folderId}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-slate-700 bg-[#0c1424] py-1 shadow-lg">
            {["Open", "Download", "Rename"].map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => setOpen(false)}
                className="block w-full px-3 py-1.5 text-left text-[11.5px] text-slate-300 hover:bg-slate-800"
              >
                {action}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type Props = {
  folders: StorageFolder[];
};

export default function FilesStorageTable({ folders }: Props) {
  const columns: Column<StorageFolder>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        accessor: (row) => row.name,
        cell: (row) => (
          <div className="flex min-w-[200px] items-center gap-3">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded",
                  // iconBgMap[row.iconColor],
                )}
              >
                <Image
                  src="/folder.png"
                  alt=""
                  width={16}
                  height={16}
                  className="size-6"
                />
              </div>
              {row.pinned && (
                <Image
                  src="/anchor.png"
                  alt="Pinned"
                  width={12}
                  height={12}
                  className="absolute -right-1 -top-1 h-3 w-3"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-white">
                {row.name}
              </div>
              <div className="truncate text-[10px] text-slate-500">
                {row.description}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "files",
        header: "Files",
        sortable: true,
        accessor: (row) => row.fileCount,
        cell: (row) => (
          <span className="text-[12px] text-slate-300">
            {formatFileCount(row.fileCount)}
          </span>
        ),
      },
      {
        key: "size",
        header: "Size",
        sortable: true,
        accessor: (row) => row.sizeGb,
        cell: (row) => (
          <span className="text-[12px] text-slate-300">
            {formatStorageGb(row.sizeGb)}
          </span>
        ),
      },
      {
        key: "lastModified",
        header: "Last Modified",
        sortable: true,
        accessor: (row) => row.lastModified,
        cell: (row) => (
          <span className="text-[12px] text-slate-400">
            {formatLastModified(row.lastModified)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row) => <FolderActionsMenu folderId={row.id} />,
        headerClassName: "w-10",
        cellClassName: "text-right",
      },
    ],
    [],
  );

  return (
    <div className={TABLE_WRAPPER_CLASS}>
      <DataTable
        columns={columns}
        data={folders}
        rowKey="id"
        emptyMessage="No folders match your search."
      />
    </div>
  );
}
