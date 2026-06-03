"use client";

import { Download, Check } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ITEMS = [
  "Financial Reports",
  "Payroll Reports",
  "Sales Tax Reports",
  "Deal Jacket Summary",
  "Audit Readiness Reports",
  "Supporting Documents",
];

export default function CpaGeneratePackage({ bare }: { bare?: boolean }) {
  const content = (
    <>
      <ul className="mb-4 space-y-2">
        {ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[11px] text-slate-300">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {item}
          </li>
        ))}
      </ul>
      <Button
        className="w-full bg-blue-600 hover:bg-blue-500"
        onClick={() => toast.success("CPA package generation started")}
      >
        <Download className="mr-2 h-4 w-4" />
        Generate CPA Package
      </Button>
    </>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">GENERATE CPA PACKAGE</h3>
      {content}
    </Card>
  );
}
