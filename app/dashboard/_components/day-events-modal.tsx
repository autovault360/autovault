"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/calendar/format-utils";
import type { CalendarEventType } from "@/lib/calendar/types";
import type { EventWithCreator } from "@/lib/events/types";
import { getEventsByDate } from "@/lib/events/server/get-events-by-date";
import { cn } from "@/lib/utils";
import { getEventDotClass } from "./admin-calendar-utils";

export type AddDashboardEventInput = {
  title: string;
  description: string | null;
};

export type DayCalendarEvent = {
  id: string;
  time: string;
  title: string;
  type: CalendarEventType;
  description?: string;
};

type RightPanelMode = "detail" | "add";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventDate: string | null;
  events: DayCalendarEvent[];
  onAdd: (data: AddDashboardEventInput) => Promise<string | null> | void;
};

function isUserEventId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function formatEventTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventType(type: CalendarEventType): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DayEventsModal({
  open,
  onOpenChange,
  eventDate,
  events,
  onAdd,
}: Props) {
  const [dbEvents, setDbEvents] = useState<EventWithCreator[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [rightMode, setRightMode] = useState<RightPanelMode>("detail");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedEvent = events.find((ev) => ev.id === selectedEventId) ?? null;
  const selectedDbEvent = dbEvents.find((ev) => ev.id === selectedEventId) ?? null;

  useEffect(() => {
    if (!open || !eventDate) return;

    setLoadingDb(true);
    void getEventsByDate(eventDate)
      .then(setDbEvents)
      .finally(() => setLoadingDb(false));
  }, [open, eventDate]);

  useEffect(() => {
    if (!open) return;

    if (events.length > 0) {
      setSelectedEventId(events[0].id);
      setRightMode("detail");
    } else {
      setSelectedEventId(null);
      setRightMode("add");
    }
    resetAddForm();
  }, [open, eventDate]);

  function resetAddForm() {
    setTitle("");
    setDescription("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetAddForm();
      setSelectedEventId(null);
      setRightMode("detail");
    }
    onOpenChange(next);
  }

  function handleSelectEvent(id: string) {
    setSelectedEventId(id);
    setRightMode("detail");
  }

  function handleShowAddForm() {
    resetAddForm();
    setRightMode("add");
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const newId = await onAdd({
        title: title.trim(),
        description: description.trim() || null,
      });
      resetAddForm();
      if (eventDate) {
        const fresh = await getEventsByDate(eventDate);
        setDbEvents(fresh);
      }
      if (newId) {
        setSelectedEventId(newId);
      } else if (events.length > 0) {
        setSelectedEventId(events[events.length - 1]?.id ?? events[0].id);
      }
      setRightMode("detail");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden border-slate-700 bg-card p-0 text-slate-200 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-800 px-5 py-4">
          <DialogTitle className="text-white">
            {eventDate ? formatFullDate(eventDate) : "Events"}
          </DialogTitle>
          <p className="text-[12px] text-slate-400">
            {events.length} event{events.length === 1 ? "" : "s"} on this day
          </p>
        </DialogHeader>

        <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-[240px_1fr]">
          <div className="border-b border-slate-800 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <span className="text-[10px] font-bold tracking-[0.12em] text-slate-500">
                EVENTS
              </span>
              <button
                type="button"
                onClick={handleShowAddForm}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
              >
                <Plus className="h-3 w-3" />
                Add Event
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {events.length === 0 ? (
                <p className="px-2 py-6 text-center text-[12px] text-slate-500">
                  No events yet. Use Add Event to create one.
                </p>
              ) : (
                <ul className="space-y-1">
                  {events.map((ev) => {
                    const isSelected = ev.id === selectedEventId && rightMode === "detail";
                    return (
                      <li key={ev.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectEvent(ev.id)}
                          className={cn(
                            "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                            isSelected
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-transparent hover:border-slate-700 hover:bg-slate-800/40",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={cn(
                                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                getEventDotClass(ev.type),
                              )}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-white">
                                {ev.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {ev.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            {rightMode === "add" ? (
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-white">Add Event</h3>
                  {events.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRightMode("detail");
                        if (!selectedEventId && events[0]) {
                          setSelectedEventId(events[0].id);
                        }
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Back to details
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-400">
                      Event title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Follow up with CPA"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-[13px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-400">
                      Description <span className="text-slate-600">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Add details for this event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-[13px] text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:text-slate-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim() || submitting}
                    className="rounded-md bg-blue-600 px-4 py-1.5 text-[12px] font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Event"}
                  </button>
                </div>
              </div>
            ) : selectedEvent ? (
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-white">Event Details</h3>
                  <button
                    type="button"
                    onClick={handleShowAddForm}
                    className="flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-blue-400 transition hover:border-slate-600 hover:bg-slate-800/40"
                  >
                    <Plus className="h-3 w-3" />
                    Add Event
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Title
                    </p>
                    <p className="mt-1 text-[15px] font-medium text-white">
                      {selectedEvent.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-300">
                      {selectedEvent.description?.trim() ||
                        selectedDbEvent?.description?.trim() ||
                        "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Time
                      </p>
                      <p className="mt-1 text-[13px] text-slate-300">{selectedEvent.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </p>
                      <p className="mt-1 text-[13px] text-slate-300">
                        {formatEventType(selectedEvent.type)}
                      </p>
                    </div>
                  </div>

                  {isUserEventId(selectedEvent.id) && (
                    <div className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
                      {loadingDb ? (
                        <p className="text-[12px] text-slate-500">Loading details...</p>
                      ) : selectedDbEvent ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Created by
                            </p>
                            <p className="mt-1 text-[13px] text-slate-300">
                              {selectedDbEvent.creator?.fullName ?? "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Created at
                            </p>
                            <p className="mt-1 text-[13px] text-slate-300">
                              {formatEventTimestamp(selectedDbEvent.created_at)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px] text-slate-500">
                          Additional event metadata is unavailable.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:text-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                <p className="text-[13px] text-slate-400">Select an event to view details.</p>
                <button
                  type="button"
                  onClick={handleShowAddForm}
                  className="mt-3 flex items-center gap-1 text-[12px] font-medium text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Event
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
