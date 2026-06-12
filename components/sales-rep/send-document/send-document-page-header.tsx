"use client";

import { FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onOpenHistory: () => void;
};

export default function SendDocumentPageHeader({ onOpenHistory }: Props) {
  return (
    <section className="mb-4 border-b border-slate-800/60 pb-4">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 text-[11px] text-slate-500"
      >
        <span>Communication</span>
        <span className="mx-1.5 text-slate-600">›</span>
        <span className="text-slate-400">Send Document</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Send Document
          </h1>
          <p className="mt-1 text-[12px] text-slate-500">
            Send documents securely to buyers, auctions, or team members.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          theme="dark"
          className="h-9 shrink-0 border-slate-700 bg-slate-900/60 text-[11.5px] text-slate-200 hover:bg-slate-800"
          onClick={onOpenHistory}
        >
          <FileClock className="h-3.5 w-3.5" />
          Send History
        </Button>
      </div>
    </section>
  );
}
