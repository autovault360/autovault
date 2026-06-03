"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import type { CpaNotePreview, CpaNotePriority, CpaNoteStatus } from "@/lib/cpa/types";

const statusBg: Record<CpaNoteStatus, string> = {
  OPEN: "border-l-blue-500 bg-blue-500/10",
  IN_PROGRESS: "border-l-amber-500 bg-amber-500/10",
  RESOLVED: "border-l-emerald-500 bg-emerald-500/10",
  ARCHIVED: "border-l-slate-500 bg-slate-500/10",
};

const priorityAccent: Record<CpaNotePriority, string> = {
  URGENT: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-yellow-500",
  LOW: "border-l-slate-500",
};

export default function CpaNotesPreview({ notes, bare }: { notes: CpaNotePreview[]; bare?: boolean }) {
  const { openNotes } = useCpaPortal();

  const header = (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">CPA NOTES</div>
      <button
        type="button"
        onClick={openNotes}
        className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
      >
        <Plus className="h-3 w-3" />
        New Note
      </button>
    </div>
  );

  const list = (
    <ul className="space-y-2">
      {notes.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={openNotes}
          className={cn(
            "w-full rounded-md border-l-4 p-2.5 text-left transition-opacity hover:opacity-90",
            statusBg[n.status],
            priorityAccent[n.priority],
          )}
        >
          <p className="text-[12px] font-medium text-white">{n.title}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{`${n.date} - ${n.creator}`}</p>
        </button>
      ))}
    </ul>
  );

  const footer = (
    <button
      type="button"
      onClick={openNotes}
      className="mt-3 w-full text-center text-[11px] text-blue-400 hover:underline"
    >
      View All Notes
    </button>
  );

  if (bare) return <>{header}{list}{footer}</>;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      {header}
      {list}
      {footer}
    </Card>
  );
}
