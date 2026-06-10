"use client";

import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/profit-loss/types";
import { formatFullDate, getInitials } from "@/lib/calendar/format-utils";
import type { CalendarEventType, IDailySalesActivity } from "@/lib/calendar/types";
import { CalendarCardShell, CalendarCardHead } from "../calendar-card-primitives";

type Props = {
  activity: IDailySalesActivity | null;
  date: string | null;
  onClose: () => void;
  onAddEvent: (event: {
    title: string;
    type: CalendarEventType;
    time: string;
    description?: string;
  }) => void;
};

export default function DayDetailPanel({
  activity,
  date,
  onClose,
  onAddEvent,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("task");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  if (!date) {
    return (
      <CalendarCardShell className="min-h-[120px] text-[11px] text-slate-500">
        Select a day to view details
      </CalendarCardShell>
    );
  }

  const handleSave = () => {
    if (!title.trim()) return;
    onAddEvent({ title, type, time, description: notes || undefined });
    setTitle("");
    setNotes("");
    setShowForm(false);
  };

  return (
    <CalendarCardShell className="overflow-y-auto text-[11px]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-white">
          {formatFullDate(date)}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Units Sold", value: String(activity?.unitsSold ?? 0) },
          {
            label: "Total Gross",
            value: formatCurrency(activity?.totalGross ?? 0),
          },
          {
            label: "Total Commission",
            value: formatCurrency(activity?.totalCommissions ?? 0),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded border border-slate-800 bg-slate-900/30 p-2 text-center"
          >
            <div className="text-[9px] text-slate-500">{stat.label}</div>
            <div className="text-[12px] font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <CalendarCardHead title="Sales on This Day" />
      <div className="mb-3 space-y-2">
        {activity?.salesReps.length ? (
          activity.salesReps.map((rep) => (
            <div
              key={rep.repId}
              className="flex items-center gap-2 rounded border border-slate-800/60 px-2 py-1.5"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={rep.avatarUrl} />
                <AvatarFallback className="text-[9px]">
                  {getInitials(rep.repName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-slate-200">
                  {rep.repName}
                </div>
                <div className="text-[9.5px] text-slate-500">
                  {rep.unitsSold} units | {formatCurrency(rep.grossProfit)} gross
                </div>
              </div>
              <div className="text-[10px] font-medium text-purple-400">
                {formatCurrency(rep.commissionsEarned)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[11px] text-slate-500">No sales recorded.</p>
        )}
      </div>

      <CalendarCardHead title="Events & Tasks" />
      <div className="mb-3 space-y-1.5">
        {activity?.events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center gap-2 rounded border border-slate-800/60 px-2 py-1.5"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            <span className="text-[10px] text-slate-500">{ev.time}</span>
            <span className="flex-1 truncate text-[11px] text-slate-300">
              {ev.title}
            </span>
            <button type="button" className="text-slate-500 hover:text-slate-300">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!activity?.events.length && (
          <p className="text-[11px] text-slate-500">No events scheduled.</p>
        )}
      </div>

      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="mb-3 w-full border-slate-700 bg-transparent text-[11px] text-slate-300"
        >
          Add New Event
        </Button>
      ) : (
        <div className="space-y-2 rounded border border-slate-800 p-2.5">
          <div>
            <Label className="text-[10px] text-slate-500">Event Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-8 border-slate-800 bg-slate-800/50 text-[11px]"
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-500">Select Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
              <SelectTrigger theme="dark" className="mt-1 h-8 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-card">
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-slate-500">Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 h-8 border-slate-800 bg-slate-800/50 text-[11px]"
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-500">Add Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-[60px] border-slate-800 bg-slate-800/50 text-[11px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              className="flex-1 border-slate-700 bg-transparent text-[11px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-[11px] hover:bg-blue-700"
            >
              Save Event
            </Button>
          </div>
        </div>
      )}
    </CalendarCardShell>
  );
}
