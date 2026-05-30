"use client";

import Link from "next/link";
import { ChevronDown, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  dealId: string;
  className?: string;
};

export default function ViewJacketButton({ dealId, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border border-blue-600/60 shadow-sm",
        className,
      )}
    >
      <Link
        href={`/dashboard/deal-jackets/${dealId}`}
        className="inline-flex h-8 items-center gap-1.5 bg-blue-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        View Jacket
      </Link>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center border-l border-blue-500/50 bg-blue-600/90 text-white transition-colors hover:bg-blue-500"
        aria-label="More jacket actions"
        onClick={(e) => e.preventDefault()}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
