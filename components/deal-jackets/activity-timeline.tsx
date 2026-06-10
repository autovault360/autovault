"use client";

import type { DealJacketActivityRow, DealJacketStatus } from "@/lib/deal-jackets/types";
import {
  DEAL_JACKET_STATUS_LABELS,
  getWorkflowStatusStyle,
} from "@/lib/deal-jackets/types";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  created: "Deal jacket created",
  submitted: "Submitted for review",
  changes_requested: "Changes requested",
  resubmitted: "Resubmitted for review",
  approved: "Deal jacket approved",
  rejected: "Deal jacket rejected",
  note_added: "Note added",
  document_uploaded: "Document uploaded",
};

function getActionDotStyle(action: string): string {
  switch (action) {
    case "approved":
      return "border-emerald-500 bg-emerald-500/20";
    case "rejected":
      return "border-red-500 bg-red-500/20";
    case "changes_requested":
      return "border-orange-500 bg-orange-500/20";
    case "resubmitted":
    case "submitted":
      return "border-blue-500 bg-blue-500/20";
    default:
      return "border-[var(--accent)] bg-[var(--bg-primary)]";
  }
}

type Props = {
  activities: DealJacketActivityRow[];
};

export default function ActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--text-muted)]">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <ul className="relative space-y-0">
      {activities.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          {index < activities.length - 1 && (
            <span
              className="absolute left-[7px] top-4 h-full w-px bg-slate-700"
              aria-hidden
            />
          )}
          <span
            className={cn(
              "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
              getActionDotStyle(item.action),
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-white">
              {ACTION_LABELS[item.action] ?? item.action}
            </div>
            {item.new_status && item.action !== "created" && (
              <div className="mt-0.5 flex items-center gap-1.5">
                {item.old_status && (
                  <span className="text-[10px] text-slate-500 line-through">
                    {DEAL_JACKET_STATUS_LABELS[item.old_status as DealJacketStatus]}
                  </span>
                )}
                {item.old_status && <span className="text-[10px] text-slate-600">→</span>}
                <span
                  className={cn(
                    "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium border",
                    getWorkflowStatusStyle(item.new_status as DealJacketStatus),
                  )}
                >
                  {DEAL_JACKET_STATUS_LABELS[item.new_status as DealJacketStatus]}
                </span>
              </div>
            )}
            {item.detail?.reviewNotes ? (
              <div className="mt-1 text-[11px] text-slate-400 italic">
                &ldquo;{String(item.detail.reviewNotes)}&rdquo;
              </div>
            ) : null}
            {item.detail?.resubmissionNotes ? (
              <div className="mt-1 text-[11px] text-slate-400 italic">
                &ldquo;{String(item.detail.resubmissionNotes)}&rdquo;
              </div>
            ) : null}
            {item.detail?.rejectionReason ? (
              <div className="mt-1 text-[11px] text-red-400/80 italic">
                &ldquo;{String(item.detail.rejectionReason)}&rdquo;
              </div>
            ) : null}
            {item.detail?.changeCategories && Array.isArray(item.detail.changeCategories) ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {(item.detail.changeCategories as string[]).map((cat: string) => (
                  <span
                    key={cat}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">
              {item.actor_name} — {formatDisplayDate(item.created_at.split("T")[0])}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
