"use client";

import type { ReactNode } from "react";
import { PageHeaderTitle } from "@/components/layout/page-header-title";

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
  headerExtra?: ReactNode;
  /** When provided, replaces the default title/description/header-extra section entirely */
  headerSection?: ReactNode;
};

export default function DealerPageShell({
  title,
  description,
  children,
  headerExtra,
  headerSection,
}: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      {headerSection ?? (
        (title || description || headerExtra) && (
          <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
            <div className="min-w-0 flex-1">
              {title ? (
                <PageHeaderTitle title={title} subtitle={description} />
              ) : (
                description && (
                  <p className="mt-0.5 text-[12px] text-[#64748b]">
                    {description}
                  </p>
                )
              )}
            </div>
            {headerExtra && (
              <div className="flex flex-wrap items-center gap-2">
                {headerExtra}
              </div>
            )}
          </section>
        )
      )}

      {children}
    </div>
  );
}
