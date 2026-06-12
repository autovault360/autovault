"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCreateDealJacketPageData } from "@/lib/deal-jackets/server/get-create-deal-jacket-page-data";
import type { CreateDealJacketPageData, IRecentlyApprovedDeal } from "@/lib/sales-rep/deal-jacket/types";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import DealJacketFormEngine from "./deal-jacket-form-engine";
import CreateDealJacketFooterWorkspace from "./create-deal-jacket-footer-workspace";

const EMPTY_RECENTLY_APPROVED: IRecentlyApprovedDeal = {
  id: "-",
  vehicleDesc: "No recently approved deals",
  buyerName: "-",
  salePrice: 0,
  grossProfit: 0,
  approvedOn: "-",
};

export default function CreateDealJacketPageContent() {
  const [data, setData] = useState<CreateDealJacketPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCreateDealJacketPageData().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-card">
            <FolderPlus className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <PageHeaderTitle
              title="Create Deal Jacket"
              subtitle="Desk a new deal with vehicle, buyer, numbers, and documents in one workspace."
              subtitleClassName="text-[12.5px]"
            />
          </div>
        </div>
        <Button
          variant="outline"
          asChild
          className="h-8 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-card"
        >
          <Link href="/dashboard/sales-reps">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to Sales Reps
          </Link>
        </Button>
      </div>

      <DealJacketFormEngine
        vinLookup
        commissionRate={data?.commissionRate ?? 0.1}
        loading={loading}
      />

      <CreateDealJacketFooterWorkspace
        recentlyApproved={data?.recentlyApproved ?? EMPTY_RECENTLY_APPROVED}
        loading={loading}
      />
    </div>
  );
}
