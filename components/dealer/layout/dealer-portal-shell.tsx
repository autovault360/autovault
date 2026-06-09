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
    <div className="flex min-h-screen w-full bg-[#060b13]">
      <DealerSidebar dealershipName={dealershipName} initials={initials} />
      <main className="min-w-0 flex-1 p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
        <div className="mx-auto w-full min-w-0 max-w-full">{children}</div>
      </main>
    </div>
  );
}
