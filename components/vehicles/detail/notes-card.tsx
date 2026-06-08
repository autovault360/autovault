"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { updateVehicleNotes } from "@/lib/vehicles/server/update-vehicle-notes";

export default function NotesCard({
  notes,
  vehicleId,
}: {
  notes: string;
  vehicleId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("payload", JSON.stringify({ vehicleId, notes: value }));
      const result = await updateVehicleNotes(formData);
      if (result.success) {
        toast.success("Notes updated");
        setEditing(false);
      } else {
        toast.error(result.error ?? "Failed to save notes");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(notes);
    setEditing(false);
  }

  return (
    <DetailCard>
      <DetailCardHead
        title="NOTES"
        action={
          editing ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-md border border-slate-700 bg-[#0e1626] px-2.5 py-1 text-[13px] text-slate-400 transition hover:border-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-blue-600 px-2.5 py-1 text-[13px] text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-slate-700 bg-[#0e1626] px-2.5 py-1 text-[13px] text-slate-300 transition hover:border-slate-600"
            >
              Edit
            </button>
          )
        }
      />
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full resize-none rounded-md border border-slate-700 bg-[#0e1626] px-3 py-2 text-[11.5px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500"
          placeholder="Add notes about this vehicle..."
          autoFocus
        />
      ) : (
        <p className="text-[11.5px] leading-relaxed text-slate-400 whitespace-pre-wrap">
          {notes || "No notes added yet."}
        </p>
      )}
    </DetailCard>
  );
}
