"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function PayrollNotesCard({
  note,
  updatedAt,
  onSave,
}: {
  note: string;
  updatedAt: string;
  onSave?: (note: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(note);

  const handleSave = () => {
    if (!draft.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    onSave?.(draft);
    toast.success("Note updated");
    setEditOpen(false);
  };

  return (
    <>
      <DetailCard className="mt-3.5 bg-[#070c14]/60 border-slate-800/80 h-auto">
        <DetailCardHead
          title="NOTES"
          action={
            <button type="button" className="text-[13px] font-medium text-blue-400 hover:text-blue-300" onClick={() => { setDraft(note); setEditOpen(true); }}>
              Edit Note
            </button>
          }
        />
        <p className="text-[11px] leading-relaxed text-slate-300">{note}</p>
        <p className="mt-2 text-[9.5px] text-slate-500">Last updated: {updatedAt}</p>
      </DetailCard>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-slate-700 bg-[#0e1626] sm:max-w-md">
          <DialogHeader><DialogTitle className="text-white">Edit Note</DialogTitle></DialogHeader>
          <Textarea theme="dark" value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[100px] border-slate-700 bg-slate-900 text-[11px]" />
          <DialogFooter>
            <Button variant="outline" theme="dark" className="border-slate-700" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button theme="dark" className="bg-blue-600" onClick={handleSave}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
