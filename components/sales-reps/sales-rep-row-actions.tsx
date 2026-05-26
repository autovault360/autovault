"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SalesRepRowActions({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-blue-500/50 bg-[#0a1220] text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        aria-label="Edit sales rep"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-[#0a1220] text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
