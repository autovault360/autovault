"use client";

import { useEffect, useRef } from "react";
import { Check, Pin, PinOff, Trash2 } from "lucide-react";
import type { StickyNote } from "@/lib/reports-reminders/types";
import { STICKY_NOTE_TEXT_CLASS } from "./sticky-note-colors";

type Props = {
  note: StickyNote;
  editable?: boolean;
  isEditing?: boolean;
  draftText?: string;
  onStartEdit?: () => void;
  onDraftChange?: (text: string) => void;
  onSave?: () => void;
  onDelete?: () => void;
  onTogglePin?: () => void;
};

export default function StickyNoteItem({
  note,
  editable = false,
  isEditing = false,
  draftText = "",
  onStartEdit,
  onDraftChange,
  onSave,
  onDelete,
  onTogglePin,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isEditing]);

  return (
    <div
      className={`flex min-h-[128px] flex-col rounded-sm p-2.5 ${STICKY_NOTE_TEXT_CLASS}`}
      style={{ backgroundColor: note.color }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        {editable ? (
          <button
            type="button"
            onClick={onTogglePin}
            className="shrink-0 opacity-80 transition hover:opacity-100"
            aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
          >
            {note.is_pinned ? (
              <Pin className="h-3.5 w-3.5 fill-slate-900 stroke-slate-900" />
            ) : (
              <PinOff className="h-3.5 w-3.5 stroke-slate-900" />
            )}
          </button>
        ) : (
          <Pin className="h-3.5 w-3.5 shrink-0 stroke-slate-900 opacity-50" />
        )}

        {editable && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="opacity-80 transition hover:opacity-100"
              aria-label="Delete note"
            >
              <Trash2 className="h-3.5 w-3.5 stroke-slate-900" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isEditing) onSave?.();
              }}
              className={`transition hover:opacity-100 ${
                isEditing ? "opacity-90" : "opacity-45"
              }`}
              aria-label="Save note"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5] text-slate-900" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 min-h-0 flex-1">
        {isEditing ? (
          <div className="rounded-md border border-slate-900/75 bg-transparent p-2">
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSave?.();
                }
              }}
              rows={3}
              className="block w-full resize-none bg-transparent text-[13px] leading-snug text-slate-900 outline-none"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={editable ? onStartEdit : undefined}
            disabled={!editable}
            className={`block w-full text-left text-[13px] lg:text-[15px] font-medium leading-snug ${
              editable ? "cursor-text" : "cursor-default"
            }`}
          >
            {note.text}
          </button>
        )}
      </div>

      <div className="text-[10px] font-medium leading-tight text-slate-900">
        <p>{note.date}</p>
        <p>{note.author}</p>
      </div>
    </div>
  );
}
