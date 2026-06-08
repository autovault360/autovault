"use client";

import type { Payment, ViewAllModalView } from "@/lib/reminders/types";
import { formatCurrency, formatShortDate } from "@/lib/reminders/format-utils";
import {
  ReminderCardHead,
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";
import ReminderStatusBadge from "./reminder-status-badge";

type Props = {
  payments: Payment[];
  totalObligations: number;
  onViewAll: (view: ViewAllModalView) => void;
};

export default function UpcomingPaymentsCard({
  payments,
  totalObligations,
  onViewAll,
}: Props) {
  const display = payments.slice(0, 5);

  return (
    <ReminderCardShell>
      <ReminderCardHead
        title="UPCOMING PAYMENTS"
        onViewAll={() => onViewAll("payments")}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              {["Payment", "Due Date", "Amount", "Status"].map((h) => (
                <th key={h} className="px-1 py-1.5 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((p) => (
              <tr key={p.id} className="border-b border-slate-800/60 last:border-0">
                <td className="px-1 py-2 text-slate-200">{p.name}</td>
                <td className="px-1 py-2 text-slate-300">{formatShortDate(p.dueDate)}</td>
                <td className="px-1 py-2 text-slate-300">{formatCurrency(p.amount)}</td>
                <td className="px-1 py-2">
                  <ReminderStatusBadge label={p.statusLabel} tone={p.statusTone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-sm border border-blue-500/25 bg-blue-500/10 px-3 py-2">
        <div className="text-[13px] text-blue-400">Total Upcoming Obligations</div>
        <div className="text-[16px] font-bold text-blue-400">
          {formatCurrency(totalObligations)}
        </div>
      </div>
      <ReminderViewMore
        label="View All Payments"
        onClick={() => onViewAll("payments")}
      />
    </ReminderCardShell>
  );
}
