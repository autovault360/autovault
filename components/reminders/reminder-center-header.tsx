"use client";

import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

type Props = {
  asOfDate: string;
  onDateChange: (date: string) => void;
};

export default function ReminderCenterHeader({ asOfDate, onDateChange }: Props) {
  return (
    <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
      <div>
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-amber-400" />
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">REMINDER CENTER</h1>
        </div>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Stay on top of important tasks, deadlines, payments, and opportunities.
        </p>
      </div>
      <Input
        theme="dark"
        mode="date"
        value={asOfDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="h-9 min-w-[160px] border-slate-800 bg-[#0e1626] text-[12.5px] text-slate-300"
      />
    </section>
  );
}
