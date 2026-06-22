"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Info,
  History,
} from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import type { IActivityItem } from "@/lib/sales-rep/dashboard/types";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-slate-800/80" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-800/80" />
        <div className="h-2 w-1/3 animate-pulse rounded bg-slate-800/60" />
      </div>
    </div>
  );
}

const iconMap = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/15" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15" },
  upload: { icon: FileUp, color: "text-cyan-400", bg: "bg-cyan-500/15" },
};

type Props = {
  activities: IActivityItem[];
  loading?: boolean;
};

export default function RecentActivityCard({ activities, loading }: Props) {
  return (
    <CardShell className="flex flex-col border border-slate-700/60 p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-3">
        <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500">
          RECENT ACTIVITY
        </span>
        <History className="h-3.5 w-3.5 text-slate-600" />
      </div>

      {/* Activity List */}
      <div className="flex-1">
        {loading ? (
          <div className="divide-y divide-slate-800/30">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="mb-2 h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/30">
            {activities.map((activity) => {
              const { icon: Icon, color, bg } = iconMap[activity.type];
              return (
                <div key={activity.id} className="flex items-start gap-3 px-4 py-3">
                  <div
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      bg,
                      color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] leading-snug text-slate-300">
                      {activity.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-600">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CardShell>
  );
}
