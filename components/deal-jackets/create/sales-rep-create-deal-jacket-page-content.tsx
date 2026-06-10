"use client";

import Link from "next/link";
import { ChevronLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesRepDealJacketFormEngine from "./sales-rep-deal-jacket-form-engine";

export default function SalesRepCreateDealJacketPageContent() {
  return (
    <div className="min-h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-card">
            <FolderPlus className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Deal Jacket
            </h1>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Desk a new deal with vehicle, buyer, numbers, and documents in one
              workspace.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          asChild
          className="h-8 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-card"
        >
          <Link href="/sales-rep/dashboard">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <SalesRepDealJacketFormEngine />
    </div>
  );
}
