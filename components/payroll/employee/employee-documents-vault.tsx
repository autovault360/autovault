"use client";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import type { PayrollDocument } from "@/lib/payroll/types";

export default function EmployeeDocumentsVault({
  documents,
}: {
  documents: PayrollDocument[];
}) {
  return (
    <DetailCard className="bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="EMPLOYEE PAYROLL DOCUMENTS" />
      <ul className="space-y-1.5">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-2.5 rounded border border-slate-800/60 bg-card/40 px-2.5 py-2">
            <FileText className="h-4 w-4 shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium text-slate-200">{doc.name}</div>
              <div className="text-[9.5px] text-slate-500">Uploaded {doc.uploadedAt}</div>
            </div>
            <button
              type="button"
              className="shrink-0 text-slate-400 hover:text-white"
              onClick={() => toast.success("Download started")}
              aria-label={`Download ${doc.name}`}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}
