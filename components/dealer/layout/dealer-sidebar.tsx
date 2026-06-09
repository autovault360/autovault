"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { AppSidebar } from "@/components/layout/sidebar";
import type { SidebarItem, SidebarGroup } from "@/components/layout/sidebar";
import { DEALER_NAV_GROUPS, type DealerNavItem } from "./dealer-nav";
import { useDealerNavigation } from "../context/dealer-dashboard-context";

function isRouteActive(pathname: string, item: SidebarItem): boolean {
  if (!item.href) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function toSidebarItem(item: DealerNavItem): SidebarItem {
  return {
    label: item.label,
    icon: item.icon,
    color: item.color,
    href: item.href,
    sectionId: item.sectionId,
    comingSoon: item.comingSoon,
  };
}

export default function DealerSidebar({
  dealershipName,
  initials,
}: {
  dealershipName: string;
  initials: string;
}) {
  const pathname = usePathname();
  const { navigateToSection, activeSection } = useDealerNavigation();

  const groups: SidebarGroup[] = DEALER_NAV_GROUPS.map((g) => ({
    label: g.label,
    items: g.items.map(toSidebarItem),
  }));

  const profileSection = (
    <div>
      <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-slate-800 text-sm text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">
            {dealershipName}
          </div>
          <div className="truncate text-[9.5px] tracking-wider text-slate-500">
            WHOLESALE DEALER
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </div>
  );

  return (
    <AppSidebar
      groups={groups}
      logoLabel="WHOLESALE DEALER PORTAL"
      profile={profileSection}
      isActive={(item) => {
        if (item.href) return isRouteActive(pathname, item);
        return item.sectionId != null && activeSection === item.sectionId;
      }}
      onNavigate={(item) => {
        if (item.href) return;
        for (const g of DEALER_NAV_GROUPS) {
          for (const orig of g.items) {
            if (orig.label === item.label && orig.sectionId) {
              navigateToSection(orig.sectionId, orig.expandAction);
              return;
            }
          }
        }
      }}
    />
  );
}
