"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CalendarCardShell({
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

export function CalendarCardHead({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      {action}
    </div>
  );
}
