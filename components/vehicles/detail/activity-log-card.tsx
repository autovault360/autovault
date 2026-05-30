"use client";

import { useState } from "react";
import {
  Car,
  DollarSign,
  Receipt,
  CheckCircle,
  AlertCircle,
  History,
  type LucideIcon,
} from "lucide-react";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { cn } from "@/lib/utils";
import { formatDetailValue } from "@/lib/vehicles/types";
import type { ActivityLogEntry } from "@/lib/vehicles/detail-types";
import {
  VehicleActionDialog,
  ModalHeader,
  ModalBody,
} from "@/components/shared/modal-primitives";

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  "dollar-sign": DollarSign,
  receipt: Receipt,
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

const colorToIconBg: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400",
  blue: "bg-blue-500/15 text-blue-400",
  orange: "bg-orange-500/15 text-orange-400",
  purple: "bg-purple-500/15 text-purple-400",
  red: "bg-red-500/15 text-red-400",
};

function ActivityDetailModal({
  entry,
  open,
  onOpenChange,
}: {
  entry: ActivityLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const Icon = iconMap[entry.icon] ?? History;
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="md">
      <ModalHeader
        icon={<Icon className="h-4 w-4 text-white" />}
        iconClassName={colorToIconBg[entry.color] ?? "bg-blue-500/15 text-blue-400"}
        title={entry.title}
        subtitle={entry.timestamp}
        onClose={() => onOpenChange(false)}
      />
      <ModalBody>
        {hasDetails ? (
          <div className="divide-y divide-slate-100">
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
                  className="flex items-start justify-between gap-4 py-2.5"
                >
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    {formattedKey}
                  </span>
                  <span className="text-right text-[12.5px] font-medium text-gray-900">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-[12.5px] text-gray-400">
            No additional details available.
          </p>
        )}
      </ModalBody>
    </VehicleActionDialog>
  );
}

export default function ActivityLogCard({
  entries,
}: {
  entries: ActivityLogEntry[];
}) {
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);

  if (entries.length === 0) {
    return (
      <DetailCard>
        <DetailCardHead title="ACTIVITY LOG" />
        <p className="py-6 text-center text-[11.5px] text-slate-500">
          No recent activity yet.
        </p>
      </DetailCard>
    );
  }

  return (
    <>
      <DetailCard>
        <DetailCardHead title="ACTIVITY LOG" />
        <div className="max-h-[320px] space-y-0.5 overflow-y-auto">
          {entries.map((entry, i) => {
            const dotColor = colorMap[entry.color] ?? "bg-blue-500";
            const Icon = iconMap[entry.icon] ?? History;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className="group flex w-full items-center gap-3 rounded-sm px-1 py-1.5 text-left transition hover:bg-slate-800/50"
              >
                <div className={cn("h-6 w-6 shrink-0 rounded-full flex items-center justify-center", colorToIconBg[entry.color] ?? "bg-blue-500/15 text-blue-400")}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[11.5px] font-semibold text-white">
                      {entry.title}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[9.5px] text-slate-500">
                    {entry.timestamp}
                  </div>
                  <p className="mt-0.5 truncate text-[10.5px] leading-relaxed text-slate-400">
                    {entry.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DetailCard>

      <ActivityDetailModal
        entry={selectedEntry}
        open={selectedEntry !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />
    </>
  );
}
