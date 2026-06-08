"use client";

import { useState } from "react";
import { CheckCircle, FileText, Upload } from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import type { VaultDocument } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const TYPE_LABELS: Record<VaultDocument["type"], string> = {
  bill_of_sale: "Bill of Sale",
  title: "Title",
  auction_invoice: "Auction Invoice",
  other: "Other",
};

export default function DocumentVaultSection() {
  const { dashboardData, loading, documentsRef, simulateSave } =
    useDealerDashboard();
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!dashboardData) return null;

  const handleUpload = async () => {
    await simulateSave();
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };

  if (loading.documents) {
    return (
      <section
        id={DEALER_SECTION_IDS.documents}
        ref={documentsRef}
        className="scroll-mt-4"
      >
        <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
          <SkeletonBar className="mb-3 h-3 w-36" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} className="h-24" />
            ))}
          </div>
        </CardShell>
      </section>
    );
  }

  return (
    <section
      id={DEALER_SECTION_IDS.documents}
      ref={documentsRef}
      className="scroll-mt-4"
    >
      <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
        <CardHead title="DOCUMENT VAULT" />

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardData.documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/15">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-white">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    {TYPE_LABELS[doc.type]}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Linked: {doc.linkedRecord}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {doc.uploadedAt}
                  </div>
                </div>
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={handleUpload}
          onKeyDown={(e) => e.key === "Enter" && handleUpload()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload();
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 transition-colors",
            dragOver
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-[#1e293b] bg-[#070c14]/40 hover:border-slate-600",
            uploaded && "border-emerald-500/50 bg-emerald-500/5",
          )}
        >
          {uploaded ? (
            <>
              <CheckCircle className="mb-2 h-10 w-10 text-emerald-400" />
              <p className="text-[13px] font-medium text-emerald-400">
                Document uploaded and attached securely
              </p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-slate-500" />
              <p className="text-[13px] font-medium text-slate-300">
                Drag and drop documents here
              </p>
              <p className="mt-1 text-[11px] text-[#64748b]">
                Bills of Sale, Titles, Auction Invoices - PDF, JPG, PNG
              </p>
            </>
          )}
        </div>
      </CardShell>
    </section>
  );
}
