import { formatKpiCurrency, type ExpensePageKpis } from "@/lib/expenses/expense-page-calculations";

const KPI_ITEMS = [
  {
    key: "totalThisMonth" as const,
    label: "Total This Month",
    accent: "#3aa0ff",
    foot: (kpis: ExpensePageKpis) =>
      `${formatKpiCurrency(kpis.totalPaidThisMonth)} paid so far`,
  },
  {
    key: "recurringMonthly" as const,
    label: "Recurring / Month",
    accent: "#a07bff",
    foot: (kpis: ExpensePageKpis) =>
      `${kpis.recurringCount} recurring item${kpis.recurringCount === 1 ? "" : "s"}`,
  },
  {
    key: "vehicleTotal" as const,
    label: "Vehicle Expenses",
    accent: "#ff9f43",
    foot: (kpis: ExpensePageKpis) =>
      `across ${kpis.vehicleCount} vehicle${kpis.vehicleCount === 1 ? "" : "s"} · feeds P&L`,
  },
  {
    key: "payrollTotal" as const,
    label: "Payroll & Commissions",
    accent: "#23d18b",
    foot: () => "wages + commissions",
  },
  {
    key: "upcomingTotal" as const,
    label: "Upcoming Payments",
    accent: "#ff5470",
    foot: (kpis: ExpensePageKpis) =>
      `${kpis.upcomingCount} unpaid due`,
  },
];

export default function ExpenseStatsCards({ kpis }: { kpis: ExpensePageKpis }) {
  return (
    <section className="mb-[22px] grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
      {KPI_ITEMS.map((item) => (
        <div
          key={item.key}
          className="relative overflow-hidden rounded-xl border border-slate-800 bg-card px-5 py-[18px] transition hover:border-slate-700 hover:bg-white/[0.025]"
        >
          <div
            className="absolute inset-x-5 bottom-0 h-0.5 rounded-sm"
            style={{ backgroundColor: item.accent }}
          />
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            {item.label}
          </div>
          <div
            className="mt-[5px] font-mono text-[19px] font-extrabold leading-none tabular-nums"
            style={{ color: item.accent }}
          >
            {formatKpiCurrency(kpis[item.key])}
          </div>
          <div className="mt-[3px] text-[10.5px] text-slate-500">{item.foot(kpis)}</div>
        </div>
      ))}
    </section>
  );
}
