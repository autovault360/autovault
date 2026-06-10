"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { AppSidebar } from "@/components/layout/sidebar";
import type { SidebarItem, SidebarGroup } from "@/components/layout/sidebar";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";
import {
  SALES_REP_NAV_GROUPS,
  type SalesRepNavItem,
} from "./sales-rep-nav";

type Props = {
  profile: ISalesRepProfile;
};

function toSidebarItem(item: SalesRepNavItem): SidebarItem {
  return {
    label: item.label,
    icon: item.icon,
    color: item.color,
    href: item.href,
    comingSoon: item.comingSoon,
    badge: item.badge,
    badgeColor: item.badgeColor,
  };
}

export default function SalesRepSidebar({ profile }: Props) {
  const groups: SidebarGroup[] = SALES_REP_NAV_GROUPS.map((g) => ({
    label: g.label,
    items: g.items.map(toSidebarItem),
  }));

  const profileSection = (
    <div>
      <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
        SALES REP PORTAL
      </div>
      <div className="space-y-1">
        <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left">
          <Avatar className="h-9 w-9">
            {profile.imageUrl ? (
              <AvatarImage src={profile.imageUrl} alt={profile.name} />
            ) : null}
            <AvatarFallback className="bg-slate-800 text-sm text-white">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {profile.name}
            </div>
            <div className="truncate text-[9.5px] tracking-wider text-slate-500">
              {profile.title.toUpperCase()}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        </div>
      </div>
    </div>
  );

  return (
    <AppSidebar
      groups={groups}
      logoWidth={200}
      logoHeight={40}
      profile={profileSection}
    />
  );
}
