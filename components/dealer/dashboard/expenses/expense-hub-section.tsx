"use client";

import { Plus } from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { Button, ButtonIcon } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import { WHOLESALE_EXPENSE_CATEGORY_LABELS } from "@/lib/dealer/dashboard/expense-form-constants";
import type { ExpenseCategory, WholesaleExpense } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

function groupExpenses(expenses: WholesaleExpense[]) {
  const groups = new Map<ExpenseCategory, WholesaleExpense[]>();
  for (const cat of Object.keys(WHOLESALE_EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]) {
    groups.set(cat, []);
  }
  for (const exp of expenses) {
    groups.get(exp.category)?.push(exp);
  }
  return groups;
}

export default function ExpenseHubSection() {
  const {
    dashboardData,
    loading,
    expensesRef,
    openExpenseModal,
  } = useDealerDashboard();

  if (!dashboardData) return null;

  if (loading.expenses) {
    return (
      <section
        id={DEALER_SECTION_IDS.expenses}
        ref={expensesRef}
        className="scroll-mt-4"
      >
        <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
          <SkeletonBar className="mb-3 h-3 w-32" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} className="h-24" />
            ))}
          </div>
        </CardShell>
      </section>
    );
  }

  const grouped = groupExpenses(dashboardData.expenses);

  return (
    <>
      <section
        id={DEALER_SECTION_IDS.expenses}
        ref={expensesRef}
        className="scroll-mt-4"
      >
        <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <CardHead title="EXPENSE SYSTEM" />
            <Button type="button" size="sm" onClick={openExpenseModal}>
              <ButtonIcon tone="danger">
                <Plus />
              </ButtonIcon>
              Add Expense
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(WHOLESALE_EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map(
              (cat) => {
                const items = grouped.get(cat) ?? [];
                const subtotal = items.reduce((s, e) => s + e.amount, 0);
                return (
                  <div
                    key={cat}
                    className="rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wide text-[#64748b]">
                        {WHOLESALE_EXPENSE_CATEGORY_LABELS[cat].toUpperCase()}
                      </span>
                      <span className="text-[12px] font-bold tabular-nums text-white">
                        {formatCurrencyExact(subtotal)}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between gap-2 text-[10px]"
                        >
                          <span className="text-slate-400">{item.description}</span>
                          <span className="shrink-0 tabular-nums text-slate-300">
                            {formatCurrencyExact(item.amount)}
                          </span>
                        </li>
                      ))}
                      {items.length === 0 && (
                        <li className="text-[10px] text-slate-600">No items</li>
                      )}
                    </ul>
                  </div>
                );
              },
            )}
          </div>
        </CardShell>
      </section>

    </>
  );
}

