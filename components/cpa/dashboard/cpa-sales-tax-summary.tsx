"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CpaSalesTaxSummary } from "@/lib/cpa/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CpaSalesTaxSummary({ data, bare }: { data: CpaSalesTaxSummary; bare?: boolean }) {
  const rows = [
    { label: "Total Taxable Sales", value: formatMoney(data.taxableSales) },
    { label: "Sales Tax Collected", value: formatMoney(data.taxCollected) },
    { label: "Tax Payments Made", value: formatMoney(data.taxPaymentsMade) },
    { label: "Balance Due", value: formatMoney(data.balanceDue), highlight: true },
    { label: "Filing Frequency", value: data.filingFrequency },
    { label: "Due Date", value: data.dueDate },
  ];

  const content = (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex justify-between gap-2 text-[11.5px]">
          <span className="text-slate-500">{row.label}</span>
          <span className={row.highlight ? "font-semibold text-red-400" : "text-white"}>{row.value}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">SALES TAX SUMMARY</h3>
      {content}
    </Card>
  );
}
