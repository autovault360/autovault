"use client";

import { Crown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { ITopPerformer, ILeaderboardEntry } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

type Props = {
  performerData: ITopPerformer;
  leaderboardEntries: ILeaderboardEntry[];
  loading?: boolean;
};

function StatColumn({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: number;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-slate-800/70 pl-4 pr-1 first:border-0 first:pl-0">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="text-[20px] font-extrabold text-white tracking-tight tabular-nums">
        {value}
      </span>
      <span className="flex items-center gap-0.5 text-[12px] font-medium text-emerald-400">
        <TrendingUp className="h-2.5 w-2.5 shrink-0" />
        <span>{delta}%</span>
        <span className="text-slate-500 font-normal ml-0.5 text-[10px] tracking-tight ">vs last month</span>
      </span>
    </div>
  );
}

export default function TopPerformerCard({ performerData, leaderboardEntries, loading }: Props) {
  if (loading) {
    return (
      <CardShell className="h-[125px] flex flex-col justify-between p-4 border rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-3 w-24" />
        </div>
        <div className="flex gap-4 items-center">
          <SkeletonBar className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex flex-1 gap-6">
            <SkeletonBar className="h-12 flex-1" />
            <SkeletonBar className="h-12 flex-1" />
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell className="p-4 border rounded-xl">
      {/* 1. Header Ribbon spanning across both internal halves */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/40 pb-2">
        <div className="text-[13px] font-bold tracking-[0.15em] text-slate-500 flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-amber-500/80" />
          <span>TOP PERFORMER</span>
        </div>
        <button className="text-[10px] font-bold text-blue-400 hover:underline bg-transparent border-0 p-0 cursor-pointer tracking-tight">
          View Full Leaderboard
        </button>
      </div>

      {/* 2. Content Split: Left half handles the Spotlight Rep, Right half hosts the Top List */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-center">
        
        {/* LEFT COMPONENT LAYER: PERFORMER SPOTLIGHT & METRICS */}
        <div className="flex flex-row items-center gap-5">
          {/* Avatar Profile Group */}
          <div className="flex items-center gap-3 shrink-0">
            <Avatar className="h-18 w-18 ring-2 ring-amber-500/30">
              {performerData.imageUrl && <AvatarImage src={performerData.imageUrl} alt={performerData.name} />}
              <AvatarFallback className="bg-slate-800 text-sm font-bold text-white">
                {performerData.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="text-[16px] font-bold text-white tracking-tight leading-none">
                {performerData.name}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20 w-fit">
                <span>#1 Top Sales Rep</span>
              </div>
            </div>
          </div>

          {/* Metric Distribution Array */}
          <div className="flex flex-row items-center flex-1  gap-1 pl-2 justify-between">
            <StatColumn
              label="Cars Sold"
              value={String(performerData.units)}
              delta={performerData.unitsDelta}
            />
            <StatColumn
              label="Gross Profit"
              value={formatCurrency(performerData.profit)}
              delta={performerData.profitDelta}
            />
            <StatColumn
              label="Commission Earned"
              value={formatCurrency(performerData.commission)}
              delta={performerData.commissionDelta}
            />
          </div>
        </div>

        {/* RIGHT COMPONENT LAYER: THE INTEGRATED LEADERBOARD ROSTER */}
        <div className="border-l border-slate-800/80 pl-6 flex flex-col gap-0.5 min-w-0">
          {leaderboardEntries.slice(0, 5).map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center justify-between rounded px-2 py-0.5 text-[11px] transition-colors h-6",
                entry.isCurrentUser 
                  ? "bg-blue-600/15 border border-blue-500/20" 
                  : "border border-transparent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded text-[9px] font-extrabold tabular-nums shrink-0",
                    entry.rank === 1 ? "bg-amber-500/20 text-amber-400" : "text-slate-500",
                    entry.rank === 2 && "text-slate-400",
                    entry.rank === 3 && "text-amber-600/80",
                  )}
                >
                  {entry.rank}
                </span>
                <span
                  className={cn(
                    "font-medium tracking-tight truncate",
                    entry.isCurrentUser ? "text-blue-300 font-bold" : "text-slate-300",
                  )}
                >
                  {entry.name} {entry.isCurrentUser && <span className="text-[9.5px] text-blue-400 font-normal">(You)</span>}
                </span>
              </div>
              <span className="font-bold tabular-nums text-slate-200 text-[11.5px] pl-2 shrink-0">
                {entry.units}
              </span>
            </div>
          ))}
        </div>

      </div>
    </CardShell>
  );
}