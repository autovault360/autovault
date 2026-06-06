"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  repName: string;
};

export default function SalesRepProfileBreadcrumb({ repName }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1.5 text-[12px] text-slate-400"
    >
      <Link
        href="/dashboard/sales-reps"
        className="transition hover:text-slate-200 text-white font-semibold text-[24px]"
      >
        Sales Reps
      </Link>
      <ChevronRight className="h-5 w-5 text-white" />
      <span className="font-medium text-white text-[20px]">{repName}</span>
    </nav>
  );
}
