"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  MoreVertical,
  Search,
  Star,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import type {
  CpaNoteDetail,
  CpaNoteListItem,
  CpaNotesSummary,
  CpaNoteStatus,
} from "@/lib/cpa/types";

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "All Notes" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "ARCHIVED", label: "Archived" },
];

const priorityColor: Record<string, string> = {
  URGENT: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-slate-400",
};

const statusBadge: Record<CpaNoteStatus, string> = {
  OPEN: "bg-orange-500/20 text-orange-400",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400",
  RESOLVED: "bg-emerald-500/20 text-emerald-400",
  ARCHIVED: "bg-slate-500/20 text-slate-400",
};

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const fn = () => setMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return mobile;
}

export default function CpaNotesModal() {
  const { notesOpen, setNotesOpen, session, refreshDashboard } = useCpaPortal();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [notes, setNotes] = useState<CpaNoteListItem[]>([]);
  const [summary, setSummary] = useState<CpaNotesSummary>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CpaNoteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    const params = new URLSearchParams({
      status: tab,
      sort,
      ...(search ? { search } : {}),
    });
    const res = await fetch(`/api/cpa/notes?${params}`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes);
      setSummary(data.summary);
      if (!selectedId && data.notes[0]) {
        setSelectedId(data.notes[0].id);
      }
    }
  }, [tab, sort, search]);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/cpa/notes/${id}`);
    if (res.ok) {
      setDetail(await res.json());
    }
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    if (!notesOpen) return;
    fetchList();
  }, [notesOpen, fetchList]);

  useEffect(() => {
    if (selectedId && notesOpen) fetchDetail(selectedId);
  }, [selectedId, notesOpen, fetchDetail]);

  useEffect(() => {
    if (!notesOpen || !session) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`cpa-notes-${session.dealershipId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cpa_note_comments",
        },
        () => {
          if (selectedId) fetchDetail(selectedId);
          fetchList();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cpa_notes",
          filter: `dealership_id=eq.${session.dealershipId}`,
        },
        () => {
          fetchList();
          refreshDashboard();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    notesOpen,
    session,
    selectedId,
    fetchDetail,
    fetchList,
    refreshDashboard,
  ]);

  const handleSendComment = async () => {
    if (!selectedId || !comment.trim()) return;
    setLoading(true);
    await fetch(`/api/cpa/notes/${selectedId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comment.trim() }),
    });
    setComment("");
    await fetchDetail(selectedId);
    setLoading(false);
  };

  const handleStatusChange = async (status: CpaNoteStatus) => {
    if (!selectedId || !session?.canManageNotes) return;
    await fetch(`/api/cpa/notes/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMenuOpen(null);
    await fetchList();
    await fetchDetail(selectedId);
    refreshDashboard();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedId || !e.target.files?.[0]) return;
    const form = new FormData();
    form.append("file", e.target.files[0]);
    await fetch(`/api/cpa/notes/${selectedId}/attachment`, {
      method: "POST",
      body: form,
    });
    await fetchDetail(selectedId);
    e.target.value = "";
  };

  const summaryCards = useMemo(
    () => [
      { label: "Total Notes", value: summary.total, icon: Star, color: "text-purple-400" },
      { label: "Open Notes", value: summary.open, icon: Bell, color: "text-orange-400" },
      { label: "In Progress", value: summary.inProgress, icon: Clock, color: "text-blue-400" },
      { label: "Resolved", value: summary.resolved, icon: CheckCircle2, color: "text-emerald-400" },
    ],
    [summary],
  );

  const body = (
    <div className="flex h-full flex-col bg-[#0b1322]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <DialogTitle className="text-lg font-bold tracking-wide text-white">
          CPA NOTES
        </DialogTitle>
        <button
          type="button"
          onClick={() => setNotesOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-slate-800 p-3 sm:grid-cols-4">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-700/80 bg-[#060d18] p-3"
          >
            <c.icon className={cn("mb-1 h-4 w-4", c.color)} />
            <p className="text-[10px] text-slate-500">{c.label}</p>
            <p className="text-xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              tab === t.key
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => fetchList()}
              placeholder="Search notes..."
              className="h-8 w-40 border-slate-700 bg-[#060d18] pl-8 text-[11px] sm:w-52"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-8 rounded-md border border-slate-700 bg-[#060d18] px-2 text-[11px] text-slate-300"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="max-h-[40vh] overflow-y-auto border-b border-slate-800 md:max-h-none md:w-[38%] md:border-b-0 md:border-r">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "relative border-b border-slate-800/50 p-3 transition-colors",
                selectedId === note.id && "bg-blue-600/10",
              )}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedId(note.id)}
              >
                <div className="flex items-start justify-between gap-2 pr-6">
                  <p className="text-[12px] font-semibold text-white">{note.title}</p>
                  <Badge className={cn("shrink-0 text-[9px]", statusBadge[note.status])}>
                    {note.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                  {note.description}
                </p>
                <p className="mt-1 text-[9px] text-slate-600">
                  {`${note.category} - ${new Date(note.createdAt).toLocaleDateString()}`}
                </p>
              </button>
              <button
                type="button"
                className="absolute right-2 top-3 text-slate-500"
                onClick={() =>
                  setMenuOpen(menuOpen === note.id ? null : note.id)
                }
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen === note.id && session?.canManageNotes && (
                <div className="absolute right-2 top-10 z-10 rounded-md border border-slate-700 bg-[#0e1626] py-1 shadow-lg">
                  {(["OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="block w-full px-3 py-1.5 text-left text-[10px] text-slate-300 hover:bg-slate-800"
                      onClick={() => {
                        setSelectedId(note.id);
                        handleStatusChange(s);
                      }}
                    >
                      Mark {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {detailLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
            </div>
          ) : detail ? (
            <>
              <h3 className="text-lg font-semibold text-white">{detail.title}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                <div>
                  <span className="text-slate-500">Category</span>
                  <p className="text-white">{detail.category}</p>
                </div>
                <div>
                  <span className="text-slate-500">Priority</span>
                  <p className={priorityColor[detail.priority]}>{detail.priority}</p>
                </div>
                <div>
                  <span className="text-slate-500">Created By</span>
                  <p className="text-white">{detail.createdByName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Created On</span>
                  <p className="text-white">
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-slate-300">
                {detail.description}
              </p>

              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#060d18] py-8 text-center">
                <span className="text-[11px] text-slate-500">
                  Drag and drop files here or click to upload
                </span>
                <span className="mt-1 text-[9px] text-slate-600">
                  PDF, JPG, PNG, XLSX, CSV, DOCX
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.docx"
                  onChange={handleFileUpload}
                />
              </label>

              {detail.attachments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {detail.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        {a.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6">
                <h4 className="text-[11px] font-semibold tracking-wider text-slate-500">
                  ACTIVITY
                </h4>
                <ul className="mt-2 space-y-3">
                  {detail.activity.map((a) => (
                    <li key={a.id} className="flex gap-2 text-[11px]">
                      <span className="text-slate-500">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                      <span className="text-white">{a.activityDescription}</span>
                      <span className="text-slate-600"> - {a.userName}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-[11px] font-semibold tracking-wider text-slate-500">
                  COMMENTS
                </h4>
                {detail.comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-slate-800 bg-[#060d18] p-2.5"
                  >
                    <p className="text-[10px] font-medium text-blue-400">
                      {c.userName}
                    </p>
                    <p className="text-[11px] text-slate-300">{c.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[60px] border-slate-700 bg-[#060d18] text-[12px]"
                />
                <Button
                  onClick={handleSendComment}
                  disabled={loading || !comment.trim()}
                  className="shrink-0 bg-blue-600 hover:bg-blue-500"
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a note to view details</p>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetContent
          side="bottom"
          className="h-[92vh] border-slate-800 bg-[#0b1322] p-0"
        >
          <SheetTitle className="sr-only">CPA Notes</SheetTitle>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="flex h-[85vh] max-h-[85vh] w-[90vw] max-w-[90vw] flex-col gap-0 overflow-hidden border-slate-700 bg-[#0b1322] p-0"
      >
        {body}
      </DialogContent>
    </Dialog>
  );
}
