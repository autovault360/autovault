"use client";

import {
  Car,
  DollarSign,
  FileText,
  Tag,
} from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const iconMap = {
  sold: Tag,
  expense: DollarSign,
  document: FileText,
  inventory: Car,
};

const iconColorMap = {
  sold: "text-emerald-400 bg-emerald-500/15",
  expense: "text-orange-400 bg-orange-500/15",
  document: "text-blue-400 bg-blue-500/15",
  inventory: "text-cyan-400 bg-cyan-500/15",
};

const DEFAULT_SHELL_CLASS = "border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm";

export default function RecentActivityPanel({
  activities,
  loading,
  shellClassName,
}: {
  activities: ActivityItem[];
  loading?: boolean;
  shellClassName?: string;
}) {
  const shellClass = cn(DEFAULT_SHELL_CLASS, shellClassName);

  if (loading) {
    return (
      <CardShell className={shellClass}>
        <SkeletonBar className="mb-3 h-3 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <SkeletonBar className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <SkeletonBar className="h-3 w-32" />
              <SkeletonBar className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </CardShell>
    );
  }

  return (
    <CardShell className={shellClass}>
      <CardHead title="RECENT ACTIVITY" />
      <ul className="space-y-2.5">
        {activities.map((item) => {
          const Icon = iconMap[item.icon];
          const colorClass = iconColorMap[item.icon];
          return (
            <li key={item.id} className="flex items-start gap-2.5">
              <div
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                  colorClass,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-white">
                  {item.action}
                </div>
                <div className="truncate text-[11px] text-[#64748b]">
                  {item.detail}
                </div>
              </div>
              <span className="shrink-0 text-[10px] text-[#475569]">
                {item.timestamp}
              </span>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
