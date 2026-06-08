"use client";

import type { Reminder, ViewAllModalView } from "@/lib/reminders/types";
import { formatShortDate } from "@/lib/reminders/format-utils";
import { formatDueStatus } from "@/lib/reminders/selectors";
import {
  ReminderCardHead,
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";
import ReminderPriorityBadge from "./reminder-priority-badge";
import { ReminderIconCircle } from "./reminder-icons";
import { cn } from "@/lib/utils";

type Props = {
  reminders: Reminder[];
  asOfDate: string;
  onViewAll: (view: ViewAllModalView) => void;
  onReminderClick: (reminder: Reminder) => void;
  selectedReminderId?: string;
};

export default function UpcomingRemindersCard({
  reminders,
  asOfDate,
  onViewAll,
  onReminderClick,
  selectedReminderId,
}: Props) {
  const display = reminders.slice(0, 4);

  return (
    <ReminderCardShell>
      <ReminderCardHead
        title="UPCOMING REMINDERS"
        onViewAll={() => onViewAll("upcoming")}
      />
      <div className="space-y-0">
        {display.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onReminderClick(r)}
            className={cn(
              "flex w-full items-start gap-2.5 border-b border-slate-800/60 py-2.5 text-left last:border-0 transition-colors hover:bg-slate-800/20",
              selectedReminderId === r.id && "bg-slate-800/30",
            )}
          >
            <ReminderIconCircle category={r.category} iconColor={r.iconColor} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-medium text-slate-200">{r.title}</div>
              <div className="text-[13px] text-slate-500">{r.description}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">
                  {formatDueStatus(r.dueDate, asOfDate) === "Due Today"
                    ? "Due Today"
                    : formatShortDate(r.dueDate)}
                </span>
                <ReminderPriorityBadge priority={r.priority} />
              </div>
            </div>
          </button>
        ))}
      </div>
      <ReminderViewMore
        label="View All Upcoming Reminders"
        onClick={() => onViewAll("upcoming")}
      />
    </ReminderCardShell>
  );
}
