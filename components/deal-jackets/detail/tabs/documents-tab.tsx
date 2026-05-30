"use client";

import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { Card, CardContent } from "@/components/ui/card";

export default function DocumentsTab({ detail }: { detail: DealJacketDetail }) {
  const allDocs = [
    ...detail.documents,
    ...Array.from(
      {
        length: Math.max(
          0,
          detail.tabCounts.documents - detail.documents.length,
        ),
      },
      (_, i) => ({
        id: `doc-extra-${i}`,
        name: `Additional Document ${i + 1}`,
        type: "document" as const,
        uploadedAt: detail.sale.dateSold,
        icon: "generic" as const,
      }),
    ),
  ];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {allDocs.map((doc) => (
        <Card
          key={doc.id}
          className="flex-row gap-0 rounded-sm border border-slate-700 bg-transparent py-0 shadow-none ring-0 transition hover:border-slate-600 hover:bg-slate-800/20"
        >
          <CardContent className="flex w-full items-center gap-3 p-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-800/80">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-white">
                {doc.name}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                Uploaded {formatDisplayDate(doc.uploadedAt)}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="border-slate-700 text-slate-400"
                aria-label="Preview"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="border-slate-700 text-slate-400"
                aria-label="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
