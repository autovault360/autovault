"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/profit-loss/types";
import { formatShortDate, getInitials } from "@/lib/calendar/format-utils";
import type {
  SoldVehicleRow,
  UpcomingComplianceEvent,
} from "@/lib/calendar/types";
import { CalendarCardShell, CalendarCardHead } from "../calendar-card-primitives";

const STATUS_COLORS = {
  urgent: "bg-red-500",
  upcoming: "bg-amber-500",
  scheduled: "bg-emerald-500",
};

type Props = {
  upcomingEvents: UpcomingComplianceEvent[];
  soldVehicles: SoldVehicleRow[];
  dayNote: string;
  onDayNoteChange: (note: string) => void;
};

export default function MonthlyRightSidebar({
  upcomingEvents,
  soldVehicles,
  dayNote,
  onDayNoteChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dayNote);

  const saveNote = () => {
    onDayNoteChange(draft);
    setEditing(false);
  };

  return (
    <div className="space-y-3.5">
      <CalendarCardShell>
        <CalendarCardHead title="Upcoming Events" />
        <div className="space-y-2">
          {upcomingEvents.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLORS[ev.status]}`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-300">{ev.title}</div>
                <div className="text-[10px] text-slate-500">
                  {formatShortDate(ev.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CalendarCardShell>

      <CalendarCardShell>
        <CalendarCardHead title={`Sold Vehicles (${soldVehicles.length})`} />
        <div className="space-y-2">
          {soldVehicles.slice(0, 8).map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 border-b border-slate-800/60 pb-2 last:border-0"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[8px]">
                  {getInitials(v.salesRep)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-slate-300">
                  {v.vehicle}
                </div>
                <div className="text-[9.5px] text-slate-500">{v.customer}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-400">
                  {formatCurrency(v.profit)}
                </div>
                <div className="text-[9px] text-purple-400">
                  {formatCurrency(v.commission)}
                </div>
              </div>
            </div>
          ))}
          {!soldVehicles.length && (
            <p className="text-[11px] text-slate-500">No vehicles sold.</p>
          )}
        </div>
      </CalendarCardShell>

      <CalendarCardShell>
        <CalendarCardHead
          title="Day Notes"
          action={
            !editing && (
              <button
                type="button"
                onClick={() => {
                  setDraft(dayNote);
                  setEditing(true);
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )
          }
        />
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[80px] border-slate-800 bg-slate-800/50 text-[11px]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[13px] text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="text-[13px] text-blue-400 hover:text-blue-300"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            {dayNote || "No notes for this day."}
          </p>
        )}
      </CalendarCardShell>
    </div>
  );
}
