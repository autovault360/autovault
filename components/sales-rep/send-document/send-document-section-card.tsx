"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  step: number;
  title: string;
  children: ReactNode;
  className?: string;
};

export default function SendDocumentSectionCard({
  step,
  title,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-800/80 bg-[#0f1520] p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-600/20 text-[11px] font-bold text-violet-400">
          {step}
        </span>
        <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}
