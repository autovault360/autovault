"use client";

import {
  AlertCircle,
  Calendar,
  Car,
  FileWarning,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReminderKpi } from "@/lib/reminders/types";
import type { TopReminderItem } from "@/lib/reports-reminders/types";
import {
  ReportCardShell,
  ReportSectionLabel,
  ReportViewMore,
} from "./report-card-primitives";

const boxStyles: Record<ReminderKpi["color"], string> = {
  red: "border-red-500/35 bg-red-950/40",
  amber: "border-orange-500/35 bg-orange-950/30",
  purple: "border-purple-500/35 bg-purple-950/35",
  blue: "border-blue-500/35 bg-blue-950/35",
  green: "border-emerald-500/35 bg-emerald-950/30",
};

const countStyles: Record<ReminderKpi["color"], string> = {
  red: "text-red-400",
  amber: "text-orange-400",
  purple: "text-purple-400",
  blue: "text-blue-400",
  green: "text-emerald-400",
};

const toneStyles: Record<TopReminderItem["statusTone"], string> = {
  red: "border-red-500/30 bg-red-500/15 text-red-400",
  orange: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  blue: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  purple: "border-purple-500/30 bg-purple-500/15 text-purple-400",
  green: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
};

const iconToneStyles: Record<TopReminderItem["iconTone"], string> = {
  amber: "bg-amber-500/20 text-amber-400",
  red: "bg-red-500/20 text-red-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  lime: "bg-lime-500/20 text-lime-400",
  blue: "bg-blue-500/20 text-blue-400",
};

function ReminderListIcon({ tone }: { tone: TopReminderItem["iconTone"] }) {
  const className = "h-3 w-3";
  const icon =
    tone === "amber" ? (
      <FileWarning className={className} />
    ) : tone === "red" ? (
      <AlertCircle className={className} />
    ) : tone === "emerald" ? (
      <Calendar className={className} />
    ) : tone === "lime" ? (
      <Car className={className} />
    ) : (
      <Wind className={className} />
    );

  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded",
        iconToneStyles[tone],
      )}
    >
      {icon}
    </span>
  );
}

function formatKpiLabel(label: string) {
  return label
    .split(" ")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

type Props = {
  kpis: ReminderKpi[];
  topReminders: TopReminderItem[];
};

export default function RemindersOverviewCard({ kpis, topReminders }: Props) {
  return (
    <ReportCardShell className="@container flex min-w-0 flex-col overflow-hidden">
      <h2 className="mb-2.5 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        REMINDERS OVERVIEW
      </h2>

      <div className="mb-3 grid min-w-0 grid-cols-2 gap-2 @min-[480px]:grid-cols-3 @min-[640px]:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={cn(
              "flex min-w-0 flex-col items-center rounded border px-1.5 py-2.5 text-center",
              boxStyles[kpi.color],
            )}
          >
            <div className="w-full text-[9px] font-semibold leading-tight text-slate-400 @min-[480px]:text-[8px] @min-[640px]:text-[7.5px]">
              {formatKpiLabel(kpi.label)}
            </div>
            <div
              className={cn(
                "my-1 text-[20px] font-bold leading-none tabular-nums @min-[640px]:my-0.5 @min-[640px]:text-[18px]",
                countStyles[kpi.color],
              )}
            >
              {kpi.count}
            </div>
            <button
              type="button"
              className="text-[9px] font-medium text-blue-400 hover:text-blue-300 @min-[640px]:text-[7.5px]"
            >
              View All ...
            </button>
          </div>
        ))}
      </div>

      <ReportSectionLabel>Top Reminders (Action Items)</ReportSectionLabel>
      <ul className="mb-1 min-h-0 flex-1 space-y-0">
        {topReminders.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1.5 border-b border-slate-800/50 py-2.5 last:border-0 @min-[400px]:grid-cols-[auto_minmax(0,1fr)_auto] @min-[400px]:items-center @min-[400px]:gap-y-0"
          >
            <ReminderListIcon tone={item.iconTone} />
            <span className="col-start-2 min-w-0 text-[11px] leading-snug text-slate-200 @min-[400px]:col-start-2">
              {item.title}
            </span>
            <span
              className={cn(
                "col-start-2 w-fit rounded border px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap @min-[400px]:col-start-3",
                toneStyles[item.statusTone],
              )}
            >
              {item.statusLabel}
            </span>
          </li>
        ))}
      </ul>

      <ReportViewMore label="View All Reminders" />
    </ReportCardShell>
  );
}
