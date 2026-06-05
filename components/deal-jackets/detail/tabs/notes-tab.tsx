"use client";

import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { Textarea } from "@/components/ui/textarea";
import {
  DetailCard,
  DetailCardHead,
  DetailCardBody,
} from "../detail-primitives";

export default function NotesTab({ detail }: { detail: DealJacketDetail }) {
  const notes = [
    {
      id: "note-1",
      type: "Deal Note",
      body: detail.dealNotes,
      author: detail.lastNoteBy,
      date: detail.lastNoteAt,
    },
    {
      id: "note-2",
      type: "Internal Note",
      body: detail.internalNotes || "No internal notes on file.",
      author: detail.salesRep.name,
      date: detail.sale.dateSold,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      {notes.map((note) => (
        <DetailCard key={note.id}>
          <DetailCardHead title={note.type.toUpperCase()} />
          <DetailCardBody>
            <p className="text-[11.5px] leading-relaxed text-slate-300">
              {note.body}
            </p>
            <p className="mt-3 text-[10px] text-[var(--text-muted)]">
              {note.author} .. {formatDisplayDate(note.date.split("T")[0])}
            </p>
          </DetailCardBody>
        </DetailCard>
      ))}

      <DetailCard className="lg:col-span-2">
        <DetailCardHead title="ADD NOTE" />
        <DetailCardBody>
          <Textarea
            placeholder="Add a deal note or internal comment..."
            className="min-h-[100px] resize-y border-slate-700 bg-[var(--bg-secondary)] text-[12px] text-slate-200 placeholder:text-slate-500"
            readOnly
          />
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">
            Note saving will be available when connected to the backend API.
          </p>
        </DetailCardBody>
      </DetailCard>
    </div>
  );
}
