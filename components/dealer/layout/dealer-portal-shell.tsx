"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AppLayout from "@/components/layout/app-layout";
import AppFooter from "@/components/layout/app-footer";
import UnifiedSidebar from "@/components/layout/unified-sidebar";
import DealerHeader from "./dealer-header";
import { DEALER_NAV_GROUPS } from "./dealer-nav";
import { useDealerDashboard, useDealerNavigation } from "../context/dealer-dashboard-context";

import type { SidebarItem } from "@/components/layout/sidebar";

function isRouteActive(pathname: string, item: SidebarItem): boolean {
  if (item.subItems?.length) {
    return item.subItems.some((sub) => isRouteActive(pathname, sub));
  }
  if (!item.href) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function DealerPortalShell({
  children,
  dealershipName,
  initials,
}: {
  children: React.ReactNode;
  dealershipName: string;
  initials: string;
}) {
  const pathname = usePathname();
  const { navigateToSection, activeSection } = useDealerNavigation();
  const { dashboardData } = useDealerDashboard();

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
    <AppLayout
      sidebar={
        <UnifiedSidebar
          groups={DEALER_NAV_GROUPS}
          profile={profileSection}
          logoLabel="WHOLESALE DEALER PORTAL"
          isActive={(item) => isRouteActive(pathname, item)}
          onNavigate={(item: SidebarItem) => {
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
      }
      header={
        <DealerHeader
          dealershipName={dealershipName}
          initials={initials}
          notificationCount={dashboardData?.notificationCount ?? 0}
        />
      }
      footer={<AppFooter />}
    >
      <div className="mx-auto w-full min-w-0 max-w-full">{children}</div>
    </AppLayout>
  );
}
