"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StateTaxHeader() {
  return (
    <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
      <div>
        <h1 className="text-xl font-bold tracking-[0.12em] text-white">STATE TAX CENTER</h1>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Manage, track, and report your state sales tax with ease.
        </p>
      </div>
      <Button theme="dark" type="button" size="lg" className="shrink-0">
        <Download className="h-3.5 w-3.5" />
        Export Reports
      </Button>
    </section>
  );
}
