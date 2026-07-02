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
    <div className="flex min-h-screen w-full bg-background">
      {sidebar}
      <main className="flex flex-1 flex-col gap-[18px] overflow-y-auto overflow-x-hidden px-3 pb-8 pt-0 sm:px-5">
        {header}
        <div className="flex-1">{children}</div>
        {footer}
      </main>
    </div>
  );
}
