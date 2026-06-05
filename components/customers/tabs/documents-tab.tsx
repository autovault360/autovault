"use client";

import { ExternalLink, FileText } from "lucide-react";
import { formatDisplayDate, type CustomerDetail } from "@/lib/customers/types";

export default function DocumentsTab({
  customer,
}: {
  customer: CustomerDetail;
}) {
  if (customer.documents.length === 0) {
    return (
      <p className="py-6 text-center text-[11.5px] text-slate-500">
        No documents on file for this customer.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {customer.documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-sm border border-slate-700 bg-[#0e1626]/50 p-3 transition hover:border-slate-600"
        >
          <div className="grid h-9 w-9 place-items-center rounded-md bg-blue-500/10">
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-white">
              {doc.label}
            </div>
            <div className="text-[10.5px] text-slate-500">
              {doc.source === "deal" ? "From deal" : "Customer document"} ..{" "}
              {formatDisplayDate(doc.createdAt)}
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        </a>
      ))}
    </div>
  );
}
