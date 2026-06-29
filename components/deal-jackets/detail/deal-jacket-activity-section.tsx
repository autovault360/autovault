"use client";

import {
  CheckCircle2,
  FileText,
  Plus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { DealJacketActivityRow } from "@/lib/deal-jackets/types";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  created: "Deal jacket created",
  submitted: "Submitted for review",
  changes_requested: "Changes requested",
  resubmitted: "Resubmitted for review",
  approved: "Vehicle marked as sold",
  rejected: "Deal jacket rejected",
  note_added: "Note added",
  document_uploaded: "Documents uploaded",
};

function getActionIcon(action: string): { icon: LucideIcon; className: string } {
  switch (action) {
    case "approved":
      return {
        icon: CheckCircle2,
        className: "bg-emerald-500/15 text-emerald-400",
      };
    case "document_uploaded":
      return {
        icon: FileText,
        className: "bg-orange-500/15 text-orange-400",
      };
    case "created":
      return {
        icon: Plus,
        className: "bg-blue-500/15 text-blue-400",
      };
    default:
      return {
        icon: UserPlus,
        className: "bg-purple-500/15 text-purple-400",
      };
  }
}

function formatActivityDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function DealJacketActivitySection({
  activities,
}: {
  activities: DealJacketActivityRow[];
}) {
  if (activities.length === 0) {
    return (
      <div className="py-6 text-center text-[12px] text-slate-500">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <ul className="space-y-0">
      {activities.map((item, index) => {
        const { icon: Icon, className } = getActionIcon(item.action);
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-3 py-3",
              index < activities.length - 1 && "border-b border-slate-800/60",
            )}
          >
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                className,
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[12px] font-medium text-white">
                  {ACTION_LABELS[item.action] ?? item.action}
                </p>
                <span className="shrink-0 text-[10px] text-slate-500">
                  {formatActivityDateTime(item.created_at)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {item.actor_name}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
