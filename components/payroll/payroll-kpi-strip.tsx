import { KPICard } from "@/components/ui/kpi-card";
import { formatPayrollCurrency, type PayrollKpis } from "@/lib/payroll/types";

function buildCards(kpis: PayrollKpis) {
  return [
    {
      icon: "dollar-sign" as const,
      color: "green",
      label: "Total Payroll Paid",
      value: formatPayrollCurrency(kpis.totalPayrollPaid),
      unit: "This Period",
      link: "View Payroll",
      sparkColor: "#22c55e",
      sparkPoints: "0,36 55,28 110,24 165,18 220,12",
    },
    {
      icon: "handshake" as const,
      color: "blue",
      label: "Commissions Paid",
      value: formatPayrollCurrency(kpis.commissionsPaid),
      unit: "This Period",
      link: "View Commissions",
      sparkColor: "#3b82f6",
      sparkPoints: "0,32 55,28 110,22 165,16 220,10",
    },
    {
      icon: "percent" as const,
      color: "violet",
      label: "Bonuses Paid",
      value: formatPayrollCurrency(kpis.bonusesPaid),
      unit: "This Period",
      link: "View Bonuses",
      sparkColor: "#a855f7",
      sparkPoints: "0,38 55,30 110,26 165,20 220,14",
    },
    {
      icon: "users" as const,
      color: "orange",
      label: "Employees Paid",
      value: String(kpis.employeesPaid),
      unit: "This Period",
      link: "View Employees",
      sparkColor: "#f97316",
      sparkPoints: "0,40 55,32 110,28 165,22 220,16",
    },
    {
      icon: "trending-down" as const,
      color: "amber",
      label: "Pending Payroll",
      value: formatPayrollCurrency(kpis.pendingPayroll),
      unit: "This Period",
      link: "View Pending",
      sparkColor: "#f59e0b",
      sparkPoints: "0,20 55,28 110,32 165,36 220,40",
    },
    {
      icon: "landmark" as const,
      color: "blue",
      label: "Next Payroll Date",
      value: kpis.nextPayrollDate,
      unit: "Scheduled",
      link: "View Calendar",
      sparkColor: "#06b6d4",
      sparkPoints: "0,30 55,24 110,20 165,16 220,12",
    },
  ];
}

export default function PayrollKpiStrip({ kpis }: { kpis: PayrollKpis }) {
  const cards = buildCards(kpis);

  return (
    <section className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          className="shadow-[0_0_0_1px_rgba(148,163,184,0.08)]"
        />
      ))}
    </section>
  );
}
