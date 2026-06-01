"use client";

import type { Reminder, ViewAllModalView } from "@/lib/reminders/types";
import { formatShortDate } from "@/lib/reminders/format-utils";
import {
  ReminderCardHead,
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";
import ReminderPriorityBadge from "./reminder-priority-badge";
import { ReminderIconCircle } from "./reminder-icons";

type Props = {
  reminders: Reminder[];
  onViewAll: (view: ViewAllModalView) => void;
};

export default function OverdueRemindersCard({ reminders, onViewAll }: Props) {
  const display = reminders.slice(0, 4);

  return (
    <ReminderCardShell>
      <ReminderCardHead
        title="OVERDUE REMINDERS"
        onViewAll={() => onViewAll("overdue")}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-[11.5px]">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              {["Type", "Title", "Description", "Due Date", "Priority"].map((h) => (
                <th key={h} className="px-1 py-1.5 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/60 last:border-0">
                <td className="px-1 py-2">
                  <ReminderIconCircle
                    category={r.category}
                    iconColor={r.iconColor}
                    size="sm"
                  />
                </td>
                <td className="px-1 py-2 text-slate-200">{r.title}</td>
                <td className="max-w-[120px] truncate px-1 py-2 text-slate-400">
                  {r.description}
                </td>
                <td className="px-1 py-2 text-red-400">{formatShortDate(r.dueDate)}</td>
                <td className="px-1 py-2">
                  <ReminderPriorityBadge priority={r.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReminderViewMore
        label="View All Overdue Reminders"
        onClick={() => onViewAll("overdue")}
      />
    </ReminderCardShell>
  );
}
