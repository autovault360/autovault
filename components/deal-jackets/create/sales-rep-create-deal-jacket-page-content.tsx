"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import { getCurrentSalesRepCommissionRate } from "@/lib/sales-rep/server/get-commission-rate";
import { getRecentlyApprovedDeal } from "@/lib/deal-jackets/server/get-create-deal-jacket-page-data";
import type { IRecentlyApprovedDeal } from "@/lib/sales-rep/deal-jacket/types";
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

export default function SalesRepCreateDealJacketPageContent() {
  const router = useRouter();
  const [commissionRate, setCommissionRate] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [recentlyApproved, setRecentlyApproved] = useState<IRecentlyApprovedDeal>(EMPTY_RECENTLY_APPROVED);
  const [footerLoading, setFooterLoading] = useState(true);

  useEffect(() => {
    getCurrentSalesRepCommissionRate().then((rate) => {
      setCommissionRate(rate);
      setLoading(false);
    });
    getRecentlyApprovedDeal().then((deal) => {
      setRecentlyApproved(deal);
      setFooterLoading(false);
    });
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
          <Link href="/sales-rep/dashboard">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <DealJacketFormEngine
        vinLookup
        commissionRate={commissionRate}
        loading={loading}
        onSuccess={() => router.push("/sales-rep/deal-jackets")}
      />

      <CreateDealJacketFooterWorkspace
        recentlyApproved={recentlyApproved}
        loading={footerLoading}
      />
    </div>
  );
}
