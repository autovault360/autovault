"use client";

import { Receipt, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";

export default function ReceiptsTab({ detail }: { detail: DealJacketDetail }) {
  type ReceiptRow = DealJacketDetail["receipts"][number] & { amount?: number };

  const allReceipts: ReceiptRow[] = [
    ...detail.receipts,
    ...Array.from(
      {
        length: Math.max(
          0,
          detail.tabCounts.receipts - detail.receipts.length,
        ),
      },
      (_, i) => ({
        id: `rcpt-extra-${i}`,
        name: `Receipt ${i + 1}`,
        type: "receipt" as const,
        uploadedAt: detail.sale.dateSold,
        icon: "receipt" as const,
        amount: 50 + i * 25,
      }),
    ),
  ];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {allReceipts.map((item) => (
        <Card
          key={item.id}
          className="gap-0 overflow-hidden rounded-sm border border-slate-700 bg-transparent py-0 shadow-none ring-0"
        >
          <div className="flex h-24 items-center justify-center bg-slate-800/50">
            <Receipt className="h-8 w-8 text-slate-600" />
          </div>
          <CardContent className="p-3">
            <div className="truncate text-[11.5px] font-medium text-white">
              {item.name}
            </div>
            <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
              {formatDisplayDate(item.uploadedAt)}
            </div>
            {item.amount != null && (
              <div className="mt-1 text-[11px] font-medium text-[var(--accent-green)]">
                {formatCurrency(item.amount)}
              </div>
            )}
            <div className="mt-2 flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1 border-slate-700 text-[10px] text-slate-400"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1 border-slate-700 text-[10px] text-slate-400"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
