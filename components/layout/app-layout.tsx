"use client";

import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

export default function AppLayout({
  children,
  sidebar,
  header,
  footer,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#010d19]">
      {sidebar}
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 pb-8 pt-16 sm:p-5 lg:pt-5">
        {header}
        <div className="flex-1">{children}</div>
        {footer}
      </main>
    </div>
  );
}
