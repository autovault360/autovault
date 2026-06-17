"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditReadiness } from "@/lib/reports-reminders/types";
import {
  ReportCardHeaderWithLink,
  ReportCardShell,
  ReportCardSubtitle,
} from "./report-card-primitives";

const GAUGE_RADIUS = 36;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

type Props = {
  audit: AuditReadiness;
  onOpen?: () => void;
};

export default function AuditReadinessCard({ audit, onOpen }: Props) {
  const dashOffset =
    GAUGE_CIRCUMFERENCE - (audit.percent / 100) * GAUGE_CIRCUMFERENCE;

  return (
    <ReportCardShell compact className="flex h-full flex-col" onClick={onOpen}>
      <ReportCardHeaderWithLink title="AUDIT READINESS" compact onClick={onOpen} />
      <ReportCardSubtitle compact>{audit.subtitle}</ReportCardSubtitle>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="flex shrink-0 items-center gap-2.5">
        <div className="relative h-[76px] w-[76px] shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="#1f2a3d"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={GAUGE_RADIUS}
              fill="none"
              stroke="#22c55e"
              strokeWidth="10"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[17px] font-bold leading-none text-white">
              {audit.percent}%
            </span>
            <span className="mt-px text-[9px] text-slate-400">Ready</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1">
          {audit.items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-1.5 text-[10px] leading-tight"
            >
              <span
                className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                  item.done
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white",
                )}
              >
                {item.done ? (
                  <Check className="h-2 w-2" strokeWidth={3} />
                ) : (
                  <Minus className="h-2 w-2" strokeWidth={3} />
                )}
              </span>
              <span className="min-w-0 flex-1 text-slate-300">{item.label}</span>
              {item.badge && (
                <span className="shrink-0 rounded border border-red-500/40 bg-red-500/20 px-1 py-px text-[8px] font-bold text-red-400">
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </ReportCardShell>
  );
}
