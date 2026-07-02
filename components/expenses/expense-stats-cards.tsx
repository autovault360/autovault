"use client";

import StatKpiCard from "@/components/ui/stat-kpi-card";
import { formatKpiCurrency, type ExpensePageKpis } from "@/lib/expenses/expense-page-calculations";

type Props = {
  kpis: ExpensePageKpis;
};

const KPI_ITEMS = [
  {
    key: "totalThisMonth" as const,
    label: "Total This Month",
    accent: "#3aa0ff",
    footer: (kpis: ExpensePageKpis) =>
      `${formatKpiCurrency(kpis.totalPaidThisMonth)} paid so far`,
  },
  {
    key: "recurringMonthly" as const,
    label: "Recurring / Month",
    accent: "#a07bff",
    footer: (kpis: ExpensePageKpis) =>
      `${kpis.recurringCount} recurring item${kpis.recurringCount === 1 ? "" : "s"}`,
  },
  {
    key: "vehicleTotal" as const,
    label: "Vehicle Expenses",
    accent: "#ff9f43",
    footer: (kpis: ExpensePageKpis) =>
      `across ${kpis.vehicleCount} vehicle${kpis.vehicleCount === 1 ? "" : "s"} · feeds P&L`,
  },
  {
    key: "payrollTotal" as const,
    label: "Payroll & Commissions",
    accent: "#23d18b",
    footer: () => "wages + commissions",
  },
  {
    key: "upcomingTotal" as const,
    label: "Upcoming Payments",
    accent: "#ff5470",
    footer: (kpis: ExpensePageKpis) =>
      `${kpis.upcomingCount} unpaid due`,
  },
];

export default function ExpenseStatsCards({ kpis }: Props) {
  return (
    <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      {KPI_ITEMS.map((item) => (
        <StatKpiCard
          key={item.key}
          kpiKey={item.key}
          accent={item.accent}
          defaultAccent={item.accent}
          label={item.label}
          value={formatKpiCurrency(kpis[item.key])}
          footer={item.footer(kpis)}
        />
      ))}
    </section>
  );
}
