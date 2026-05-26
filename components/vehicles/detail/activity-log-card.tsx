"use client";

import { useState } from "react";
import {
  Car,
  DollarSign,
  Receipt,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import {
  DetailCard,
  DetailCardHead,
  DetailCardFooter,
} from "@/components/vehicles/detail/detail-card";
import { cn } from "@/lib/utils";
import { formatDetailValue } from "@/lib/vehicles/types";
import type { ActivityLogEntry } from "@/lib/vehicles/detail-types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  "dollar-sign": DollarSign,
  receipt: Receipt,
  "check-circle": CheckCircle,
};

const colorStyles: Record<
  string,
  { bg: string; ring: string; icon: string }
> = {
  emerald: {
    bg: "bg-emerald-500/20",
    ring: "bg-emerald-500/30",
    icon: "text-emerald-400",
  },
  blue: {
    bg: "bg-blue-500/20",
    ring: "bg-blue-500/30",
    icon: "text-blue-400",
  },
  orange: {
    bg: "bg-orange-500/20",
    ring: "bg-orange-500/30",
    icon: "text-orange-400",
  },
  purple: {
    bg: "bg-purple-500/20",
    ring: "bg-purple-500/30",
    icon: "text-purple-400",
  },
  red: {
    bg: "bg-red-500/20",
    ring: "bg-red-500/30",
    icon: "text-red-400",
  },
};

function TimelineIcon({ entry }: { entry: ActivityLogEntry }) {
  const Icon = iconMap[entry.icon] ?? Car;
  const styles = colorStyles[entry.color] ?? colorStyles.emerald;

  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div
        className={cn(
          "absolute h-8 w-8 rounded-full animate-pulse",
          styles.ring,
        )}
      />
      <div
        className={cn(
          "relative grid h-7 w-7 place-items-center rounded-full",
          styles.bg,
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", styles.icon)} />
      </div>
    </div>
  );
}

function DetailModal({
  entry,
  open,
  onOpenChange,
}: {
  entry: ActivityLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "gap-0 overflow-hidden border-0 bg-[#0f1621] p-0 text-slate-100 shadow-xl ring-0",
        hasDetails
          ? "w-[min(560px,calc(100vw-2rem))] sm:max-w-[560px]"
          : "w-[min(480px,calc(100vw-2rem))] sm:max-w-[480px]",
      )}>
        <DialogTitle className="sr-only">Activity Details</DialogTitle>
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="text-[15px] font-bold text-slate-100">{entry.title}</h2>
        </div>
        {hasDetails ? (
          <div className="max-h-[65vh] space-y-0 overflow-y-auto px-5 py-4">
            {Object.entries(entry.details!).map(([key, value]) => {
              const formattedKey = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const formattedValue =
                value === null || value === undefined
                  ? "—"
                  : typeof value === "number" &&
                      (key.toLowerCase().includes("price") ||
                        key.toLowerCase().includes("cost") ||
                        key.toLowerCase().includes("fee") ||
                        key.toLowerCase().includes("tax") ||
                        key.toLowerCase().includes("profit") ||
                        key.toLowerCase().includes("loss") ||
                        key.toLowerCase().includes("total"))
                    ? `$${value.toLocaleString()}`
                    : formatDetailValue(key, value, entry.details);
              return (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 border-b border-slate-800 py-2.5 last:border-0"
                >
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {formattedKey}
                  </span>
                  <span className="text-right text-[12.5px] font-medium text-slate-200">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-6 text-center text-[12.5px] text-slate-400">
            No additional details available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ActivityLogCard({
  entries,
}: {
  entries: ActivityLogEntry[];
}) {
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);

  return (
    <>
      <DetailCard className="h-full min-h-0">
        <DetailCardHead
          title="ACTIVITY LOG"
          action={
            <button
              type="button"
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
            >
              View Full History →
            </button>
          }
        />
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedEntry(entry)}
              className="flex w-full gap-2.5 text-left transition hover:opacity-80"
            >
              <div className="flex flex-col items-center">
                <TimelineIcon entry={entry} />
                {i < entries.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-slate-800" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[11.5px] font-semibold text-white">
                    {entry.title}
                  </div>
                  <div className="shrink-0 text-[9.5px] text-slate-500">
                    {entry.timestamp}
                  </div>
                </div>
                <div className="mt-0.5 text-[10.5px] leading-relaxed text-slate-400">
                  {entry.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        <DetailCardFooter label="View Full History" />
      </DetailCard>

      <DetailModal
        entry={selectedEntry}
        open={selectedEntry !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />
    </>
  );
}
