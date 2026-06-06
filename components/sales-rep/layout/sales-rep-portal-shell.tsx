"use client";

import SalesRepSidebar from "./sales-rep-sidebar";

export default function SalesRepPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#010d19]">
      <SalesRepSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
        {children}
      </main>
    </div>
  );
}
