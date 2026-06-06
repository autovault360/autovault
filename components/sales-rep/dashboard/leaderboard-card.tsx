"use client";

import { cn } from "@/lib/utils";
import { ReportCardShell } from "@/components/reports-reminders/report-card-primitives";
import type { ILeaderboardEntry } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

type Props = {
  entries: ILeaderboardEntry[];
  loading?: boolean;
};

export default function LeaderboardCard({ entries, loading }: Props) {
  if (loading) {
    return (
      <ReportCardShell className="p-4 bg-[#0b1329]/40 border border-slate-800/60 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-3 w-28" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="mb-1.5 h-6 w-full last:mb-0" />
        ))}
      </ReportCardShell>
    );
  }

  return (
    <ReportCardShell className="p-4 flex flex-col justify-between h-full bg-[#0b1329]/40 border border-slate-800/60 rounded-xl">
      <div>
        {/* Header Ribbon Actions */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10.5px] font-bold tracking-[0.15em] text-slate-500">
            TOP SALES REPS
          </h2>
          <button className="text-[10px] font-bold text-blue-400 hover:underline bg-transparent border-0 p-0 cursor-pointer">
            View Full Leaderboard
          </button>
        </div>

        {/* Compact Dense Roster Wrapper */}
        <div className="min-h-0 flex-1 flex flex-col gap-0.5">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1 text-[11.5px] transition-colors",
                entry.isCurrentUser 
                  ? "bg-blue-600/15 border border-blue-500/20" 
                  : "hover:bg-slate-800/30 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded text-[9.5px] font-extrabold tabular-nums",
                    entry.rank === 1 ? "bg-amber-500/20 text-amber-400" : "text-slate-500",
                    entry.rank === 2 && "text-slate-400",
                    entry.rank === 3 && "text-amber-600/80",
                  )}
                >
                  {entry.rank}
                </span>
                <span
                  className={cn(
                    "font-medium tracking-tight",
                    entry.isCurrentUser ? "text-blue-300 font-bold" : "text-slate-300",
                  )}
                >
                  {entry.name} {entry.isCurrentUser && <span className="text-[10px] text-blue-400 font-normal">(You)</span>}
                </span>
              </div>
              <span className="font-bold tabular-nums text-slate-200 text-[12px]">
                {entry.units}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ReportCardShell>
  );
}