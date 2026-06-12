"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";

type Props = {
  sectionNumber: number;
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  collapsedContent?: ReactNode;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  showSectionNumber?: boolean;
  expandedToggleLabel?: string;
  collapsedToggleLabel?: string;
};

export default function DashboardExpandableShell({
  sectionNumber,
  title,
  subtitle,
  defaultExpanded = false,
  collapsedContent,
  children,
  className,
  headerActions,
  showSectionNumber = true,
  expandedToggleLabel = "Hide Details",
  collapsedToggleLabel = "View Details",
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className={cn("mb-3.5", className)}>
      <div className={cn("rounded-sm", ADMIN_PANEL_SHELL_CLASS)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b]/80 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {showSectionNumber && (
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                {sectionNumber}
              </span>
            )}
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-[0.14em] text-white">
                {title}
              </div>
              {subtitle && (
                <div className="mt-0.5 text-[10px] text-slate-500">{subtitle}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1 text-[11px] text-blue-400 transition hover:text-blue-300"
            >
              {expanded ? expandedToggleLabel : collapsedToggleLabel}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-250",
                  expanded && "rotate-180",
                )}
              />
            </button>
            {headerActions}
          </div>
        </div>

        {!expanded && collapsedContent && (
          <div className="px-3.5 py-2">{collapsedContent}</div>
        )}

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-250 ease-in-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "transition-opacity duration-250 ease-in-out",
                expanded ? "opacity-100" : "opacity-0",
              )}
            >
              {expanded && <div className="px-3.5 pb-3.5 pt-2">{children}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
