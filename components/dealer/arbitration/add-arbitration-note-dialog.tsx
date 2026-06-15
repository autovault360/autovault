"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addArbitrationNote,
  getArbitrationNotes,
} from "@/lib/dealer/arbitration/server/arbitration-notes";
import {
  formatDisplayDate,
  getArbitrationVehicleName,
  type ArbitrationNote,
  type ArbitrationRecord,
} from "@/lib/dealer/arbitration/types";

type Props = {
  record: ArbitrationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function AddArbitrationNoteDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState<ArbitrationNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record || !open) return;

    setBody("");
    setLoadingNotes(true);
    getArbitrationNotes(record.id)
      .then((result) => {
        if (result.success) {
          setNotes(result.notes);
        } else {
          toast.error(result.error);
          setNotes([]);
        }
      })
      .finally(() => setLoadingNotes(false));
  }, [record, open]);

  const handleSave = async () => {
    if (!record || !body.trim()) return;

    setSaving(true);
    const result = await addArbitrationNote({
      vehicleId: record.id,
      body: body.trim(),
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Arbitration note added");
    setBody("");
    onOpenChange(false);
    onSuccess?.();
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0a101d] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Add Arbitration Note</DialogTitle>
          <DialogDescription className="text-slate-400">
            Private team note for {getArbitrationVehicleName(record)} (
            {record.stockNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border border-[#1e293b] bg-[#0c1424] p-3 text-[12px] text-slate-300">
            <div className="font-medium text-white">{record.arbitrationReason}</div>
            <div className="mt-1 text-slate-500">
              Buyer / Dealer: {record.buyerDealer}
            </div>
          </div>

          <Textarea
            theme="dark"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Record updates or details for the arbitration process..."
            className="min-h-[100px] text-[13px]"
            maxLength={2000}
          />

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Previous Notes
            </div>
            {loadingNotes ? (
              <div className="flex items-center gap-2 py-4 text-[12px] text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notes...
              </div>
            ) : notes.length === 0 ? (
              <p className="py-2 text-[12px] text-slate-500">No notes yet.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border border-slate-800 bg-slate-900/50 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-400">
                        {note.authorName}
                      </span>
                      <span>{formatNoteTimestamp(note.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[12px] text-slate-200">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !body.trim()}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatNoteTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
