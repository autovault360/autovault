"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/layout/app-layout";
import AppFooter from "@/components/layout/app-footer";
import UnifiedSidebar from "@/components/layout/unified-sidebar";
import SalesRepHeader from "./sales-rep-header";
import SalesRepQuickActionsHost from "./sales-rep-quick-actions-host";
import { SALES_REP_NAV_GROUPS } from "./sales-rep-nav";
import { SalesRepQuickActionsProvider } from "@/lib/portal/sales-rep-quick-actions-context";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

type Props = {
  children: React.ReactNode;
  profile: ISalesRepProfile;
};

export default function SalesRepPortalShell({ children, profile }: Props) {
  const profileSection = (
    <div>
      <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
        SALES REP PORTAL
      </div>
      <div className="space-y-1">
        <Link
          href="/sales-rep/profile"
          className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left transition-colors hover:bg-slate-800"
        >
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
        </Link>
      </div>
    </div>
  );

  return (
    <SalesRepQuickActionsProvider>
      <AppLayout
        sidebar={
          <UnifiedSidebar groups={SALES_REP_NAV_GROUPS} profile={profileSection} />
        }
        header={<SalesRepHeader profile={profile} />}
        footer={<AppFooter />}
      >
        {children}
      </AppLayout>
      <SalesRepQuickActionsHost />
    </SalesRepQuickActionsProvider>
  );
}
