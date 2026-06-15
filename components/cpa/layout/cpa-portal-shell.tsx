"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/layout/app-layout";
import UnifiedSidebar from "@/components/layout/unified-sidebar";
import CpaPortalHeader from "./cpa-portal-header";
import CpaFooter from "./cpa-footer";
import { CPA_NAV_GROUPS } from "./cpa-nav";
import type { CpaSession } from "@/lib/cpa/types";
import { CpaPortalProvider } from "../context/cpa-portal-context";
import CpaNotesModal from "../notes/cpa-notes-modal";

export default function CpaPortalShell({
  session,
  children,
}: {
  session: CpaSession;
  children: React.ReactNode;
}) {
  const profileSection = session ? (
    <div>
      <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
        CPA ACCOUNT
      </div>
      <div className="space-y-1">
        <Link
          href="/cpa/profile"
          className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left transition-colors hover:bg-slate-800"
        >
          <Avatar className="h-9 w-9">
            {session.imageUrl ? (
              <AvatarImage src={session.imageUrl} alt={session.fullName} />
            ) : null}
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
        </Link>
      </div>
    </div>
  ) : undefined;

  return (
    <CpaPortalProvider session={session}>
      <AppLayout
        sidebar={<UnifiedSidebar groups={CPA_NAV_GROUPS} profile={profileSection} />}
        header={<CpaPortalHeader />}
        footer={<CpaFooter />}
      >
        {children}
      </AppLayout>
      <CpaNotesModal />
    </CpaPortalProvider>
  );
}
