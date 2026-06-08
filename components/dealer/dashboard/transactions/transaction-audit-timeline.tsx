"use client";

import { cn } from "@/lib/utils";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";

function formatAuditTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TransactionAuditTimeline({
  events,
}: {
  events: DealerTransaction["auditEvents"];
}) {
  return (
    <div className="rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3">
      <div className="mb-2 text-[10px] font-bold tracking-wide text-[#64748b]">
        AUDIT HISTORY
      </div>
      <ol className="relative space-y-3 border-l border-[#1e293b] pl-4">
        {events.map((event, i) => (
          <li key={`${event.at}-${i}`} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#1e293b] bg-blue-500" />
            <div className="text-[11px] font-semibold text-white">
              {event.action}
            </div>
            <div className="text-[10px] text-[#64748b]">
              {formatAuditTime(event.at)}
              {event.actor ? ` - ${event.actor}` : ""}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
