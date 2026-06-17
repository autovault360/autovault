"use client";

import { useState } from "react";
import type { StateTaxReport } from "@/lib/state-tax/types";
import StateTaxHeader from "./state-tax-header";
import StateTaxTabs from "./state-tax-tabs";
import StateTaxOverview from "./state-tax-overview";
import StateTaxPeriodsList from "./state-tax-periods-list";
import StateTaxTransactionsTable from "./state-tax-transactions-table";
import StateTaxConfigForm from "./state-tax-config-form";
import StateTaxReminders from "./state-tax-reminders";

type Props = {
  report: StateTaxReport;
};

export default function StateTaxPageContent({ report }: Props) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="relative">
      <StateTaxHeader />

      <StateTaxTabs
        tabs={report.tabs.map((t) => ({ id: t.id, label: t.label }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "overview" && <StateTaxOverview report={report} />}

      {activeTab === "reports" && (
        <StateTaxPeriodsList periods={report.periods} />
      )}

      {activeTab === "transactions" && (
        <StateTaxTransactionsTable transactions={report.transactions} />
      )}

      {activeTab === "configuration" && (
        <StateTaxConfigForm
          settings={{
            state: report.config.state,
            frequency: report.config.filingFrequency.toLowerCase() as "monthly" | "quarterly" | "annual" | "custom",
            reminderDays: 14,
          }}
        />
      )}

      {activeTab === "reminders" && (
        <StateTaxReminders reminders={report.reminders} />
      )}
    </div>
  );
}
