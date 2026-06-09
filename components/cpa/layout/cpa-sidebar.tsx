"use client";

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/layout/sidebar";
import type { SidebarItem, SidebarGroup } from "@/components/layout/sidebar";
import { useCpaPortal } from "../context/cpa-portal-context";
import { CPA_NAV_GROUPS, type CpaNavItem } from "./cpa-nav";

function toSidebarItem(item: CpaNavItem): SidebarItem {
  const isNotes = item.opensNotes || item.badgeKey === "notes";
  return {
    label: item.label,
    icon: item.icon,
    color: item.color,
    href: isNotes ? undefined : item.href,
    comingSoon: item.comingSoon,
  };
}

export default function CpaSidebar() {
  const { session, dashboard, openNotes } = useCpaPortal();
  const openCount = dashboard?.notesSummary.open ?? 0;
  const inProgress = dashboard?.notesSummary.inProgress ?? 0;
  const badgeCount = openCount + inProgress;

  const groups: SidebarGroup[] = CPA_NAV_GROUPS.map((g) => ({
    label: g.label,
    items: g.items.map((item) => {
      const sidebarItem = toSidebarItem(item);
      if (item.badgeKey === "notes") {
        sidebarItem.badge = badgeCount > 0 ? badgeCount : undefined;
        sidebarItem.badgeColor = "red";
        sidebarItem.onClick = () => openNotes();
      }
      return sidebarItem;
    }),
  }));

  const profileSection = session ? (
    <div>
      <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
        CPA ACCOUNT
      </div>
      <div className="space-y-1">
        <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-800 text-sm text-white">
              {session.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {session.fullName}
            </div>
            <div className="truncate text-[9.5px] tracking-wider text-slate-500">
              CPA ACCOUNT
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <AppSidebar
      groups={groups}
      logoWidth={200}
      logoHeight={40}
      profile={profileSection}
    />
  );
}
