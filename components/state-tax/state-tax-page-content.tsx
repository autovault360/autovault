"use client";

import { useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { STATE_TAX_MOCK_REPORT } from "@/lib/state-tax/mock-data";
import type { StateTaxTab } from "@/lib/state-tax/types";
import StateTaxConfigForm from "./state-tax-config-form";
import StateTaxHeader from "./state-tax-header";
import StateTaxKpiCards from "./state-tax-kpi-cards";
import StateTaxTabs from "./state-tax-tabs";
import StateTaxTransactionsTable from "./state-tax-transactions-table";
import StateTaxYtdSummary from "./state-tax-ytd-summary";

export default function StateTaxPageContent() {
  const [activeTab, setActiveTab] = useState<StateTaxTab>("overview");
  const report = STATE_TAX_MOCK_REPORT;

  return (
    <div className="relative">
      <AdminHeader searchPlaceholder="Search transactions, invoices, or vehicles…" />

      <StateTaxHeader />

      <StateTaxTabs
        tabs={report.tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <>
          <StateTaxConfigForm
            config={report.config}
            options={report.configOptions}
          />

          <StateTaxKpiCards kpis={report.kpis} />

          <section className="grid gap-3.5 xl:grid-cols-2">
            <StateTaxYtdSummary summary={report.ytdSummary} />
            <StateTaxTransactionsTable transactions={report.transactions} />
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
