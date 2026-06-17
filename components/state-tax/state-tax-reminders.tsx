"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ReminderInfo } from "@/lib/state-tax/types";

type Props = {
  reminders: ReminderInfo[];
};

export default function StateTaxReminders({ reminders }: Props) {
  if (reminders.length === 0) {
    return (
      <Card className="rounded-sm border border-slate-700 bg-card p-8 text-center shadow-none">
        <Bell className="mx-auto mb-2 h-8 w-8 text-slate-600" />
        <p className="text-[13px] text-slate-500">
          No upcoming reminders. All filing periods are up to date.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reminders.map((r) => {
        const dueDate = new Date(r.dueDate);
        const isUrgent = r.daysUntilDue <= 3;

        return (
          <Link key={r.periodId} href={`/dashboard/state-tax/${r.periodId}`}>
            <Card
              className={`cursor-pointer rounded-sm border ${isUrgent ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"} p-4 shadow-none transition hover:border-slate-500`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-bold text-white">
                    {r.periodName} — Sales Tax Filing
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-400">
                    {r.vehicleCount} vehicle{r.vehicleCount !== 1 ? "s" : ""} in
                    this filing period
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={`text-[12px] font-semibold ${isUrgent ? "text-red-400" : "text-amber-300"}`}
                  >
                    {isUrgent ? "Overdue" : `${r.daysUntilDue} days`}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Due{" "}
                    {dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
