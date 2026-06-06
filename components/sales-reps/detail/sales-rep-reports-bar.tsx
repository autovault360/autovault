"use client";

import {
  Bot,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Handshake,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SalesRepReportAction } from "@/lib/sales-reps/profile-types";

const ICON_MAP: Record<SalesRepReportAction["icon"], LucideIcon> = {
  "file-text": FileText,
  "dollar-sign": DollarSign,
  handshake: Handshake,
  "file-spreadsheet": FileSpreadsheet,
  printer: Printer,
};

const ICON_BG: Record<SalesRepReportAction["color"], string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
  violet: "bg-purple-500/15 text-purple-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
};

const FOOTER_CARD_CONTENT_HEIGHT = "min-h-[88px]";

type Props = {
  actions: SalesRepReportAction[];
};

export default function SalesRepReportsBar({ actions }: Props) {
  return (
    <Card className="flex h-full w-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h2 className="mb-2.5 shrink-0 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        Reports &amp; Actions
      </h2>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch",
          FOOTER_CARD_CONTENT_HEIGHT,
        )}
      >
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) => {
            const Icon = ICON_MAP[action.icon];
            return (
              <button
                key={action.id}
                type="button"
                className="flex h-full min-h-[88px] items-center gap-2.5 rounded-md border border-slate-700/80 bg-[#0a101c]/40 p-2.5 text-left transition hover:border-slate-600 hover:bg-slate-800/30"
              >
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    ICON_BG[action.color],
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold leading-tight text-slate-200">
                    {action.label}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-snug text-slate-500">
                    {action.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          size="lg"
          className="flex h-full min-h-[88px] w-full shrink-0 flex-col items-center justify-center gap-1 px-4 py-3 text-center sm:w-[200px]"
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold">
            <Bot className="h-4 w-4" />
            Generate Rep Summary
          </div>
          <span className="text-[10px] font-normal text-blue-100/80">
            Full summary package
          </span>
        </Button>
      </div>
    </Card>
  );
}
