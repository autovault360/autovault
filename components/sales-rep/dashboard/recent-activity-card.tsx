"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Info,
} from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import type { IActivityItem } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
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
    <CardShell className="flex-1">
      <div className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        RECENT ACTIVITY
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-slate-800" />
          {activities.map((activity) => {
            const { icon: Icon, color, bg } = iconMap[activity.type];
            return (
              <div key={activity.id} className="relative flex gap-3 py-2">
                <div
                  className={cn(
                    "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    bg,
                    color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
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
    </CardShell>
  );
}
