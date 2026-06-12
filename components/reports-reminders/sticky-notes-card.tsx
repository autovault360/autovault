"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StickyNote } from "@/lib/reports-reminders/types";
import { getStickyNotes } from "@/lib/sticky-notes/server/get-sticky-notes";
import { createStickyNote } from "@/lib/sticky-notes/server/create-sticky-note";
import { deleteStickyNote } from "@/lib/sticky-notes/server/delete-sticky-note";
import { updateStickyNote } from "@/lib/sticky-notes/server/update-sticky-note";
import { togglePin } from "@/lib/sticky-notes/server/toggle-pin";
import type { StickyNoteWithUser } from "@/lib/sticky-notes/types";
import AddStickyNoteModal, {
  type AddStickyNoteInput,
} from "./add-sticky-note-modal";
import StickyNoteItem from "./sticky-note-item";

type Props = {
  notes?: StickyNote[];
  noCard?: boolean;
  hideHeader?: boolean;
  dashboardPath?: string;
  showModal?: boolean;
  onShowModalChange?: (open: boolean) => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function rowToStickyNote(row: StickyNoteWithUser): StickyNote {
  return {
    id: row.id,
    color: row.color,
    text: row.text,
    date: formatDate(row.created_at),
    author: row.user?.fullName ?? "Unknown",
    is_pinned: row.is_pinned,
    dashboard_path: row.dashboard_path,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_id: row.user_id,
  };
}

function sortNotes(notes: StickyNote[]): StickyNote[] {
  const pinned = notes.filter((note) => note.is_pinned);
  const unpinned = notes.filter((note) => !note.is_pinned);
  return [...pinned, ...unpinned];
}

export default function StickyNotesCard({
  notes: propNotes,
  noCard,
  hideHeader = false,
  dashboardPath,
  showModal: controlledShowModal,
  onShowModalChange,
}: Props) {
  const [notes, setNotes] = useState<StickyNote[]>(propNotes ?? []);
  const [loading, setLoading] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(false);
  const showModal = controlledShowModal ?? internalShowModal;
  const setShowModal = onShowModalChange ?? setInternalShowModal;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const cancelledPendingIds = useRef(new Set<string>());
  const pendingCreateText = useRef(new Map<string, string>());

  const fetchNotes = useCallback(async () => {
    if (!dashboardPath) return;
    setLoading(true);
    const rows = await getStickyNotes(dashboardPath);
    setNotes(rows.map(rowToStickyNote));
    setLoading(false);
  }, [dashboardPath]);

  useEffect(() => {
    if (dashboardPath) {
      fetchNotes();
    }
  }, [dashboardPath, fetchNotes]);

  useEffect(() => {
    if (propNotes && !dashboardPath) {
      setNotes(propNotes);
    }
  }, [propNotes, dashboardPath]);

  function startEdit(note: StickyNote) {
    if (!dashboardPath) return;
    setEditingId(note.id);
    setDraftText(note.text);
  }

  function handleDelete(id: string) {
    if (editingId === id) {
      setEditingId(null);
      setDraftText("");
    }

    if (id.startsWith("pending-")) {
      cancelledPendingIds.current.add(id);
      pendingCreateText.current.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return;
    }

    const snapshot = notes;
    const deletedNote = snapshot.find((n) => n.id === id);
    if (!deletedNote) return;

    setNotes((prev) => prev.filter((n) => n.id !== id));

    const payload = JSON.stringify({ id });
    const fd = new FormData();
    fd.append("payload", payload);

    void deleteStickyNote(fd).then((result) => {
      if (!result.success) {
        setNotes(snapshot);
      }
    });
  }

  function handleAdd(data: AddStickyNoteInput) {
    if (!dashboardPath) return;

    const tempId = `pending-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const snapshot = notes;
    const author =
      notes.find((note) => note.author && note.author !== "Unknown")?.author ??
      "You";

    pendingCreateText.current.set(tempId, data.text);

    const optimisticNote: StickyNote = {
      id: tempId,
      color: data.color,
      text: data.text,
      date: formatDate(now),
      author,
      is_pinned: false,
      dashboard_path: dashboardPath,
      created_at: now,
    };

    setNotes((prev) => sortNotes([...prev, optimisticNote]));

    const payload = JSON.stringify({
      text: data.text,
      color: data.color,
      dashboard_path: dashboardPath,
    });
    const fd = new FormData();
    fd.append("payload", payload);

    void createStickyNote(fd).then((result) => {
      if (cancelledPendingIds.current.has(tempId)) {
        cancelledPendingIds.current.delete(tempId);
        pendingCreateText.current.delete(tempId);
        if (result.success) {
          const deleteFd = new FormData();
          deleteFd.append("payload", JSON.stringify({ id: result.id }));
          void deleteStickyNote(deleteFd);
        }
        return;
      }

      if (result.success) {
        const latestText = pendingCreateText.current.get(tempId) ?? data.text;
        pendingCreateText.current.delete(tempId);

        setNotes((prev) =>
          sortNotes(
            prev.map((note) =>
              note.id === tempId
                ? { ...note, id: result.id, text: latestText }
                : note,
            ),
          ),
        );

        if (latestText !== data.text) {
          const updateFd = new FormData();
          updateFd.append(
            "payload",
            JSON.stringify({ id: result.id, text: latestText }),
          );
          void updateStickyNote(updateFd);
        }
        return;
      }

      pendingCreateText.current.delete(tempId);
      setNotes(snapshot);
    });
  }

  function handleSaveEdit(id: string) {
    const trimmed = draftText.trim();
    if (!trimmed) return;

    const snapshot = notes;
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, text: trimmed } : note)),
    );
    setEditingId(null);
    setDraftText("");

    if (id.startsWith("pending-")) {
      pendingCreateText.current.set(id, trimmed);
      return;
    }

    const payload = JSON.stringify({ id, text: trimmed });
    const fd = new FormData();
    fd.append("payload", payload);

    void updateStickyNote(fd).then((result) => {
      if (!result.success) {
        setNotes(snapshot);
        setEditingId(id);
        setDraftText(trimmed);
      }
    });
  }

  function handleTogglePin(id: string, current: boolean) {
    const snapshot = notes;
    setNotes((prev) =>
      sortNotes(
        prev.map((note) =>
          note.id === id ? { ...note, is_pinned: !current } : note,
        ),
      ),
    );

    if (id.startsWith("pending-")) return;

    const payload = JSON.stringify({ id, pinned: !current });
    const fd = new FormData();
    fd.append("payload", payload);

    void togglePin(fd).then((result) => {
      if (!result.success) {
        setNotes(snapshot);
      }
    });
  }

  const noteList = notes;
  const editable = Boolean(dashboardPath);

  const content = (
    <>
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-bold tracking-[0.12em] text-slate-500">
            STICKY NOTES
          </h2>
          {dashboardPath && !onShowModalChange && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
            >
              <Plus className="h-3 w-3" />
              New Note
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-[11px] text-slate-500">Loading notes...</p>
      ) : noteList.length === 0 ? (
        <p className="text-[11px] text-slate-500">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {noteList.map((note) => (
            <StickyNoteItem
              key={note.id}
              note={note}
              editable={editable}
              isEditing={editingId === note.id}
              draftText={editingId === note.id ? draftText : note.text}
              onStartEdit={() => startEdit(note)}
              onDraftChange={setDraftText}
              onSave={() => handleSaveEdit(note.id)}
              onDelete={() => handleDelete(note.id)}
              onTogglePin={() => handleTogglePin(note.id, !!note.is_pinned)}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      {noCard ? (
        <div className={hideHeader ? "w-full" : "w-full p-3.5"}>{content}</div>
      ) : !noteList.length ? null : (
        <Card className="w-full rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
          {content}
        </Card>
      )}

      {dashboardPath && (
        <AddStickyNoteModal
          open={showModal}
          onOpenChange={setShowModal}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
