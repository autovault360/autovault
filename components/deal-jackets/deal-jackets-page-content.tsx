"use client";

import { Download, Printer } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import DealJacketsInventory from "@/components/deal-jackets/deal-jackets-inventory";
import DealJacketStatsCards from "@/components/deal-jackets/deal-jacket-stats-cards";
import { downloadDealJacketsCsv } from "@/lib/deal-jackets/export-deal-jackets";
import { filterDealJackets } from "@/lib/deal-jackets/filter-deal-jackets";
import type { DealJacketListItem, DealJacketStats } from "@/lib/deal-jackets/types";
import type { PortalModuleOptions } from "@/lib/portal/module-options";
import { resolvePortalModuleOptions } from "@/lib/portal/module-options";
import { useMemo, useState } from "react";

type Props = PortalModuleOptions & {
  dealJackets: DealJacketListItem[];
  stats: DealJacketStats;
  salesRepFilterOptions: { id: string; label: string }[];
};

export default function DealJacketsPageContent({
  dealJackets,
  stats,
  salesRepFilterOptions,
  readOnly,
  showAdminHeader,
  basePath,
}: Props) {
  const { showAdminHeader: showHeader, basePath: portalBasePath } =
    resolvePortalModuleOptions({ readOnly, showAdminHeader, basePath });
  const [exporting, setExporting] = useState(false);

  const exportable = useMemo(
    () =>
      filterDealJackets(dealJackets, {
        tab: "all",
        search: "",
        salesRepId: "all",
        paymentMethod: "all",
      }),
    [dealJackets],
  );

  const handleExport = () => {
    if (exportable.length === 0) return;
    setExporting(true);
    try {
      downloadDealJacketsCsv(exportable);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative">
      {showHeader && <AdminHeader />}

      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">DEAL JACKETS</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            {portalBasePath === "/cpa"
              ? "Review sold vehicles, deal documentation, and commission status."
              : "View and manage all sold vehicles and their deal jackets."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || exportable.length === 0}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 bg-transparent px-3.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 bg-transparent px-3.5 text-[12px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </section>

      <DealJacketStatsCards stats={stats} />

      <DealJacketsInventory
        dealJackets={dealJackets}
        salesRepFilterOptions={salesRepFilterOptions}
        jacketBasePath={`${portalBasePath}/deal-jackets`}
      />
    </div>
  );
}
