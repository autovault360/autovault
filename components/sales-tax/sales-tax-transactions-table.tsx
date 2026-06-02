"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SalesTaxTransaction } from "@/lib/sales-tax/types";

type Props = {
  transactions: SalesTaxTransaction[];
};

function CollectedBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
      Collected
    </span>
  );
}

export default function SalesTaxTransactionsTable({ transactions }: Props) {
  return (
    <Card className="flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-white">
          Recent Sales Tax Transactions
        </h2>
        <Link
          href="#"
          className="shrink-0 text-[11px] font-medium text-blue-400 hover:text-blue-300"
        >
          View All
        </Link>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              {[
                "Date",
                "Invoice / Deal #",
                "Vehicle",
                "Taxable Amount",
                "Tax Collected",
                "Status",
              ].map((col) => (
                <th
                  key={col}
                  className={cn(
                    "pb-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500",
                    col === "Taxable Amount" || col === "Tax Collected"
                      ? "text-right"
                      : "text-left",
                    col === "Status" && "text-center",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-slate-800/50 last:border-0"
              >
                <td className="py-2.5 text-[11.5px] text-slate-300">{tx.date}</td>
                <td className="py-2.5">
                  <Link
                    href="#"
                    className="text-[11.5px] font-medium text-blue-400 hover:text-blue-300"
                  >
                    {tx.invoiceNumber}
                  </Link>
                </td>
                <td className="py-2.5 text-[11.5px] text-slate-300">
                  {tx.vehicle}
                </td>
                <td className="py-2.5 text-right text-[11.5px] text-slate-300">
                  {tx.taxableAmountFormatted}
                </td>
                <td className="py-2.5 text-right text-[11.5px] font-medium text-slate-200">
                  {tx.taxCollectedFormatted}
                </td>
                <td className="py-2.5 text-center">
                  <CollectedBadge />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
