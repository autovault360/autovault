"use client";

import { useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { SALES_TAX_MOCK_REPORT } from "@/lib/sales-tax/mock-data";
import type { SalesTaxTab } from "@/lib/sales-tax/types";
import SalesTaxConfigForm from "./sales-tax-config-form";
import SalesTaxHeader from "./sales-tax-header";
import SalesTaxKpiCards from "./sales-tax-kpi-cards";
import SalesTaxTabs from "./sales-tax-tabs";
import SalesTaxTransactionsTable from "./sales-tax-transactions-table";
import SalesTaxYtdSummary from "./sales-tax-ytd-summary";

export default function SalesTaxPageContent() {
  const [activeTab, setActiveTab] = useState<SalesTaxTab>("overview");
  const report = SALES_TAX_MOCK_REPORT;

  return (
    <div className="relative">
      <AdminHeader searchPlaceholder="Search transactions, invoices, or vehicles…" />

      <SalesTaxHeader />

      <SalesTaxTabs
        tabs={report.tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <>
          <SalesTaxConfigForm
            config={report.config}
            options={report.configOptions}
          />

          <SalesTaxKpiCards kpis={report.kpis} />

          <section className="grid gap-3.5 xl:grid-cols-2">
            <SalesTaxYtdSummary summary={report.ytdSummary} />
            <SalesTaxTransactionsTable transactions={report.transactions} />
          </section>
        </>
      )}

      {activeTab !== "overview" && (
        <div className="rounded-sm border border-slate-700 bg-transparent p-8 text-center">
          <p className="text-[13px] font-medium text-slate-300">
            {report.tabs.find((t) => t.id === activeTab)?.label}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            This section will be available when backend integration is added.
          </p>
        </div>
      )}
    </div>
  );
}
