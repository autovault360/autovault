"use client";

import type { ReminderCategorySummary, ViewAllModalView } from "@/lib/reminders/types";
import {
  ReminderCardHead,
  ReminderCardShell,
  ReminderViewMore,
} from "./reminder-card-primitives";
import { ReminderIconCircle } from "./reminder-icons";

type Props = {
  categories: ReminderCategorySummary[];
  onViewAll: (view: ViewAllModalView) => void;
};

export default function ReminderCategoriesCard({ categories, onViewAll }: Props) {
  return (
    <ReminderCardShell>
      <ReminderCardHead
        title="REMINDERS BY CATEGORY"
        onViewAll={() => onViewAll("categories")}
      />
      <div className="space-y-0">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className="flex items-center gap-2.5 border-b border-slate-800/60 py-2 last:border-0"
          >
            <ReminderIconCircle category={cat.category} iconColor={cat.iconColor} />
            <div className="min-w-0 flex-1 text-[11.5px] text-slate-200">
              {cat.label}
            </div>
            <div className="text-right">
              <div className="text-[12px] font-semibold text-white">{cat.count}</div>
              <div className="text-[9.5px] text-slate-500">Pending</div>
            </div>
          </div>
        ))}
      </div>
      <ReminderViewMore
        label="View All Reminders"
        onClick={() => onViewAll("categories")}
      />
    </ReminderCardShell>
  );
}
