"use client";

import type { CpaSession } from "@/lib/cpa/types";
import { CpaPortalProvider } from "../context/cpa-portal-context";
import CpaNotesModal from "../notes/cpa-notes-modal";
import CpaFooter from "./cpa-footer";
import CpaSidebar from "./cpa-sidebar";

export default function CpaPortalShell({
  session,
  children,
}: {
  session: CpaSession;
  children: React.ReactNode;
}) {
  return (
    <CpaPortalProvider session={session}>
      <div className="flex h-screen bg-[#010d19]">
        <CpaSidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
          {children}
          <CpaFooter />
        </main>
      </div>
      <CpaNotesModal />
    </CpaPortalProvider>
  );
}
