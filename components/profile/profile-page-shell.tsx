"use client";

import type { ReactNode } from "react";
import { PageHeaderTitle } from "@/components/layout/page-header-title";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ProfilePageShell({
  title = "My Profile",
  subtitle = "Manage your personal information and contact details.",
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl min-w-0">
      <section className="mb-5 border-b border-slate-800/60 pb-4">
        <PageHeaderTitle title={title} subtitle={subtitle} />
      </section>
      {children}
    </div>
  );
}
