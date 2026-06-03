"use client";

import { Pin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StickyNote } from "@/lib/reports-reminders/types";

type Props = {
  notes: StickyNote[];
};

export default function StickyNotesCard({ notes }: Props) {
  return (
    <Card className="w-full rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-bold tracking-[0.12em] text-slate-500">
          STICKY NOTES
        </h2>
        <button
          type="button"
          className="shrink-0 text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          + New Note
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="relative flex min-h-[100px] flex-col rounded-md p-2.5 text-slate-800"
            style={{ backgroundColor: note.color }}
          >
            <div className="mb-1 flex items-start justify-between gap-1">
              <Pin className="h-3 w-3 shrink-0 opacity-50" />
              <button
                type="button"
                className="text-slate-700/60 hover:text-slate-800"
                aria-label="Delete note"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {note.title && (
              <p className="mb-0.5 text-[10px] font-bold leading-tight">
                {note.title}
              </p>
            )}
            <p className="flex-1 text-[10px] leading-snug">{note.text}</p>
            <p className="mt-2 text-[8.5px] font-medium opacity-75">
              {note.date}
              <br />
              {note.author}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
