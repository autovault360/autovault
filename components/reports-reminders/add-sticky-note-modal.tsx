"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  STICKY_NOTE_COLORS,
  STICKY_NOTE_DEFAULT_COLOR,
} from "./sticky-note-colors";

export type AddStickyNoteInput = {
  text: string;
  color: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: AddStickyNoteInput) => void;
};

export default function AddStickyNoteModal({
  open,
  onOpenChange,
  onAdd,
}: Props) {
  const [text, setText] = useState("");
  const [color, setColor] = useState<string>(STICKY_NOTE_DEFAULT_COLOR);

  function handleSubmit() {
    if (!text.trim()) return;

    onAdd({
      text: text.trim(),
      color,
    });

    setText("");
    setColor(STICKY_NOTE_DEFAULT_COLOR);
    onOpenChange(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setText("");
      setColor(STICKY_NOTE_DEFAULT_COLOR);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Sticky Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-400">
              Note
            </label>
            <textarea
              placeholder="Write your note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-[13px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
              Color
            </label>
            <div className="flex gap-2">
              {STICKY_NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-[12px] font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
