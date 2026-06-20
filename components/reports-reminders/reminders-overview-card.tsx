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
  red: "border-red-500/40 bg-red-950/45",
  amber: "border-orange-500/40 bg-orange-950/35",
  purple: "border-purple-500/40 bg-purple-950/40",
  blue: "border-blue-500/40 bg-blue-950/40",
  green: "border-emerald-500/40 bg-emerald-950/35",
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
  onOpen?: () => void;
};

export default function RemindersOverviewCard({ kpis, topReminders, onOpen }: Props) {
  return (
    <ReportCardShell className="flex h-full min-w-0 flex-col overflow-hidden" onClick={onOpen}>
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        REMINDERS OVERVIEW
      </h2>

      <div className="mb-3 grid grid-cols-5 gap-1">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={cn(
              "flex min-w-0 flex-col items-center rounded border px-0.5 py-2 text-center",
              boxStyles[kpi.color],
            )}
          >
            <div className="w-full text-[7px] font-semibold leading-tight text-slate-400 sm:text-[7.5px]">
              {formatKpiLabel(kpi.label)}
            </div>
            <div
              className={cn(
                "my-1 text-[17px] font-bold leading-none tabular-nums sm:text-[18px]",
                countStyles[kpi.color],
              )}
            >
              {kpi.count}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen?.();
              }}
              className="text-[7px] font-medium text-blue-400 hover:text-blue-300 sm:text-[7.5px]"
            >
              View All �†’
            </button>
          </div>
        ))}
      </div>

      <ReportSectionLabel>Top Reminders (Action Items)</ReportSectionLabel>
      <ul className="mb-1 min-h-0 flex-1">
        {topReminders.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 border-b border-slate-800/50 py-2 last:border-0"
          >
            <ReminderListIcon tone={item.iconTone} />
            <span className="min-w-0 flex-1 text-[10.5px] leading-snug text-slate-200 sm:text-[11px]">
              {item.title}
            </span>
            <span
              className={cn(
                "shrink-0 rounded border px-1.5 py-0.5 text-[8.5px] font-semibold whitespace-nowrap sm:text-[9px]",
                toneStyles[item.statusTone],
              )}
            >
              {item.statusLabel}
            </span>
          </li>
        ))}
      </ul>

      <ReportViewMore label="View All Reminders" onClick={onOpen} />
    </ReportCardShell>
  );
}
