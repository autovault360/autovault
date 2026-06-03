"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaStorageFolder } from "@/lib/cpa/types";

const colorMap: Record<string, string> = {
  blue: "text-blue-400",
  orange: "text-orange-400",
  red: "text-red-400",
  green: "text-emerald-400",
  purple: "text-purple-400",
  teal: "text-teal-400",
};

export default function CpaFilesWidget({ folders, bare }: { folders: CpaStorageFolder[]; bare?: boolean }) {
  const content = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {folders.map((f) => (
        <button
          key={f.id}
          type="button"
          className="flex flex-col items-center rounded-lg border border-slate-800 bg-[#060d18] p-3 transition-colors hover:border-slate-600"
        >
          <Image src="/folder.png" alt="" width={28} height={28} />
          <span className="mt-2 text-center text-[10px] font-medium text-white">{f.name}</span>
          <span className={cn("text-[10px]", colorMap[f.iconColor])}>{f.fileCount} files</span>
        </button>
      ))}
    </div>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">FILES &amp; STORAGE</h3>
      {content}
    </Card>
  );
}
