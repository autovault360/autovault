"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FolderPlus } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { fetchCreateDealJacketMock } from "@/mock-data/create-deal-jacket.mock";
import type { CreateDealJacketPageData } from "@/lib/sales-rep/deal-jacket/types";
import UnifiedDealJacketFormEngine from "./unified-deal-jacket-form-engine";
import CreateDealJacketFooterWorkspace from "./create-deal-jacket-footer-workspace";

export default function CreateDealJacketPageContent() {
  const [data, setData] = useState<CreateDealJacketPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCreateDealJacketMock(800).then((result) => {
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
      <AdminHeader />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-[#0e1626]">
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
          className="h-8 border-slate-700 bg-transparent text-[12px] text-slate-300 hover:bg-[#0e1626]"
        >
          <Link href="/dashboard/sales-reps">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to Sales Reps
          </Link>
        </Button>
      </div>

      <UnifiedDealJacketFormEngine
        viewMode="create"
        vehicles={data?.vehicles ?? []}
        documents={data?.documents ?? []}
        buyerAttachments={
          data?.buyerAttachments ?? {
            driverLicense: { fileName: "", uploaded: false },
            insurance: { fileName: "", uploaded: false },
          }
        }
        commissionRate={data?.commissionRate ?? 0.1}
        loading={loading}
        defaultVehicleId={data?.vehicles[0]?.id}
      />

      <CreateDealJacketFooterWorkspace data={data} loading={loading} />
    </div>
  );
}
