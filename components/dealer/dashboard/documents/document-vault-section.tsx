"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, FolderOpen } from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { DEALER_ROUTES } from "@/lib/dealer/dashboard/navigation";
import { getWholesaleDocumentStats } from "@/lib/dealer/documents/server/get-wholesale-document-stats";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
  );
}

export default function DocumentVaultSection() {
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stats = await getWholesaleDocumentStats();
        if (!cancelled) setTotalDocuments(stats.totalDocuments);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="scroll-mt-4">
        <CardShell className="border-[#1e293b] bg-card backdrop-blur-sm">
          <SkeletonBar className="mb-3 h-3 w-36" />
          <SkeletonBar className="h-24" />
        </CardShell>
      </section>
    );
  }

  return (
    <section className="scroll-mt-4">
      <CardShell className="border-[#1e293b] bg-card">
        <CardHead title="DOCUMENT VAULT" />

        <div className="flex flex-col gap-3 rounded-md border border-[#1e293b] bg-[#070c14]/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-500/15">
              <FolderOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">
                {totalDocuments.toLocaleString()} documents in storage
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Bills of sale, titles, auction invoices, and more
              </p>
            </div>
          </div>

          <Link
            href={DEALER_ROUTES.documents}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 text-[12px] font-medium text-white transition hover:bg-emerald-500"
          >
            <FileText className="h-3.5 w-3.5" />
            Open Documents
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardShell>
    </section>
  );
}
