"use client";

import SalesRepSidebar from "./sales-rep-sidebar";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

type Props = {
  children: React.ReactNode;
  profile: ISalesRepProfile;
};

export default function SalesRepPortalShell({ children, profile }: Props) {
  return (
    <div className="flex h-screen bg-[#010d19]">
      <SalesRepSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
        {children}
      </main>
    </div>
  );
}
