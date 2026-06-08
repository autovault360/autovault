"use client";

import DealerSidebar from "./dealer-sidebar";

export default function DealerPortalShell({
  children,
  dealershipName,
  initials,
}: {
  children: React.ReactNode;
  dealershipName: string;
  initials: string;
}) {
  return (
    <div className="flex h-screen bg-[#060b13]">
      <DealerSidebar dealershipName={dealershipName} initials={initials} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
        {children}
      </main>
    </div>
  );
}
