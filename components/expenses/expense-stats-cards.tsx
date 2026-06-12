import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency, type ExpenseStats } from "@/lib/expenses/types";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";

function buildCards(stats: ExpenseStats) {
  return [
    {
      icon: "dollar-sign" as const,
      color: "red",
      label: "Total Expenses (MTD)",
      value: formatCurrency(stats.totalExpensesMtd),
      delta: stats.totalExpensesMtdDelta,
      deltaColor: stats.totalExpensesMtdDeltaColor,
      link: "View Expenses",
      sparkColor: "#ef4444",
      sparkPoints: "0,40 55,32 110,28 165,20 220,12",
    },
    {
      icon: "landmark" as const,
      color: "orange",
      label: "Total Expenses (YTD)",
      value: formatCurrency(stats.totalExpensesYtd),
      delta: stats.totalExpensesYtdDelta,
      deltaColor: stats.totalExpensesYtdDeltaColor,
      link: "View YTD",
      sparkColor: "#f97316",
      sparkPoints: "0,38 55,30 110,32 165,22 220,14",
    },
    {
      icon: "users" as const,
      color: "blue",
      label: "Average Daily Expense",
      value: formatCurrency(stats.averageDailyExpense),
      delta: stats.averageDailyExpenseDelta,
      deltaColor: stats.averageDailyExpenseDeltaColor,
      link: "View Daily",
      sparkColor: "#3b82f6",
      sparkPoints: "0,36 55,28 110,24 165,18 220,10",
    },
    {
      icon: "percent" as const,
      color: "green",
      label: "% of Revenue (MTD)",
      value: `${stats.revenuePercentMtd}%`,
      delta: stats.revenuePercentMtdDelta,
      deltaColor: stats.revenuePercentMtdDeltaColor,
      link: "View Revenue",
      sparkColor: "#10b981",
      sparkPoints: "0,20 55,28 110,24 165,32 220,36",
    },
  ];
}

export default function ExpenseStatsCards({ stats }: { stats: ExpenseStats }) {
  const cards = buildCards(stats);

  return (
    <section className="mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KPICard
          key={card.label}
          data={card}
          showSparkline={false}
          showLink={false}
          deltaColor={card.deltaColor}
          className={ADMIN_PANEL_SHELL_CLASS}
        />
      ))}
    </section>
  );
}
