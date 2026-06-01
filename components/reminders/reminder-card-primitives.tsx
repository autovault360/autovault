"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ReminderCardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 text-slate-200 shadow-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function ReminderCardHead({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {title}
      </div>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-[10.5px] font-medium text-blue-400 hover:text-blue-300"
        >
          View All
        </button>
      )}
    </div>
  );
}

export function ReminderViewMore({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-auto -mx-3.5 -mb-3.5 rounded-b-sm border-t border-slate-700 bg-transparent py-2.5 text-center text-[11.5px] font-medium text-blue-400 hover:text-blue-300"
    >
      {label} ?
    </button>
  );
}
