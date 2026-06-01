"use client";

import type { RecurringPayment, ViewAllModalView } from "@/lib/reminders/types";
import { formatCurrency, formatShortDate } from "@/lib/reminders/format-utils";
import {
  ReminderCardHead,
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";

type Props = {
  payments: RecurringPayment[];
  onViewAll: (view: ViewAllModalView) => void;
};

export default function RecurringPaymentsCard({ payments, onViewAll }: Props) {
  const display = payments.slice(0, 5);

  return (
    <ReminderCardShell>
      <ReminderCardHead
        title="RECURRING PAYMENTS"
        onViewAll={() => onViewAll("recurring")}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-[11.5px]">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              {["Vendor", "Category", "Due Date", "Amount", "Frequency"].map((h) => (
                <th key={h} className="px-1 py-1.5 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((p) => (
              <tr key={p.id} className="border-b border-slate-800/60 last:border-0">
                <td className="px-1 py-2 text-slate-200">{p.vendor}</td>
                <td className="px-1 py-2 text-slate-400">{p.category}</td>
                <td className="px-1 py-2 text-slate-300">{formatShortDate(p.dueDate)}</td>
                <td className="px-1 py-2 text-slate-300">{formatCurrency(p.amount)}</td>
                <td className="px-1 py-2 text-slate-400">{p.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReminderViewMore
        label="View All Recurring Payments"
        onClick={() => onViewAll("recurring")}
      />
    </ReminderCardShell>
  );
}
