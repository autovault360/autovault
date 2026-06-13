"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, SlidersHorizontal } from "lucide-react";
import AddExpenseModal from "@/components/expenses/add/add-expense-modal";
import ExpenseStatsCards from "@/components/expenses/expense-stats-cards";
import ExpensesInventory from "@/components/expenses/expenses-inventory";
import type { ExpenseDetail, ExpenseStats } from "@/lib/expenses/types";
import { getExpenseDetail } from "@/lib/expenses/types";
import type { ExpenseFormType } from "@/lib/expenses/form-types";
import { useAdminQuickActionsOptional } from "@/lib/portal/admin-quick-actions-context";

const ExpenseDetailPanel = dynamic(
  () => import("@/components/expenses/expense-detail-panel"),
  { ssr: false },
);

type Props = {
  expenses: ExpenseDetail[];
  stats: ExpenseStats;
  defaultOpen?: boolean;
  expenseType?: ExpenseFormType;
};

export default function ExpensesPageContent({
  expenses,
  stats,
  defaultOpen = false,
  expenseType = "general",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultId = expenses[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const [addOpen, setAddOpen] = useState(defaultOpen);
  const [isPending, startTransition] = useTransition();
  const urlAddOpen = searchParams.get("add") === "true";
  const urlExpenseType = (searchParams.get("type") as ExpenseFormType | null) ?? expenseType;
  const adminQuickActions = useAdminQuickActionsOptional();
  const useGlobalAdd = Boolean(adminQuickActions);

  useEffect(() => {
    if (!useGlobalAdd || !urlAddOpen) return;
    adminQuickActions?.triggerAddExpense(urlExpenseType);
    window.history.replaceState(null, "", pathname);
  }, [adminQuickActions, pathname, urlAddOpen, urlExpenseType, useGlobalAdd]);

  const selectedExpense = useMemo(
    () => (selectedId ? getExpenseDetail(expenses, selectedId) : null),
    [expenses, selectedId],
  );

  const handleSelect = useCallback((row: ExpenseDetail) => {
    setSelectedId((prev) => (prev === row.id ? null : row.id));
  }, []);

  useEffect(() => {
    if (useGlobalAdd) return;
    setAddOpen(urlAddOpen);
  }, [urlAddOpen, useGlobalAdd]);

  const handleRequestAdd = () => {
    if (adminQuickActions) {
      adminQuickActions.triggerAddExpense(urlExpenseType);
      return;
    }
    handleAddOpenChange(true);
  };

  const handleAddOpenChange = useCallback(
    (next: boolean) => {
      setAddOpen(next);
      if (next) {
        window.history.replaceState(
          null,
          "",
          `${pathname}?add=true&type=${urlExpenseType ?? "general"}`,
        );
        return;
      }
      window.history.replaceState(null, "", pathname);
      startTransition(() => {
        router.refresh();
      });
    },
    [pathname, urlExpenseType, router],
  );

  const handleExpenseDeleted = useCallback(() => {
    setSelectedId(null);
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute left-0 right-0 top-0 z-50 h-0.5 animate-pulse bg-blue-500" />
      )}
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
            <div>
              <h1 className="text-xl font-bold tracking-[0.12em] text-white">EXPENSES</h1>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Track and manage all dealership expenses
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-800/50 px-3.5 text-[12.5px] text-slate-300"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                May 1 ... May 31, 2025
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 text-[11.5px] text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </section>

          <ExpenseStatsCards stats={stats} />

          <ExpensesInventory
            expenses={expenses}
            selectedId={selectedId}
            onSelect={handleSelect}
            onRequestAdd={handleRequestAdd}
            loading={isPending}
          />
        </div>

        {selectedExpense && !addOpen && (
          <ExpenseDetailPanel
            expense={selectedExpense}
            onClose={() => setSelectedId(null)}
            onDeleted={handleExpenseDeleted}
          />
        )}
      </div>

      {!useGlobalAdd && (
        <AddExpenseModal
          open={addOpen}
          onOpenChange={handleAddOpenChange}
          expenseType={urlExpenseType}
        />
      )}
    </div>
  );
}
