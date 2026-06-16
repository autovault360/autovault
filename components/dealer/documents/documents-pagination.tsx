"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  label?: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function DocumentsPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  label = "documents",
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-800/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-slate-500">
        Showing {from} to {to} of {total.toLocaleString()} {label}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-[11px] text-slate-300"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 border-slate-700 bg-transparent p-0 text-slate-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[11px] text-slate-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "grid h-8 min-w-8 place-items-center rounded-md px-2 text-[11px] font-medium transition-colors",
                page === p
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 border-slate-700 bg-transparent p-0 text-slate-400"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
