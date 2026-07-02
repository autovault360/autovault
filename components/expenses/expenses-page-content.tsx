"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddExpenseModal from "@/components/expenses/add/add-expense-modal";
import EditExpenseModal from "@/components/expenses/add/edit-expense-modal";
import ExpenseStatsCards from "@/components/expenses/expense-stats-cards";
import ExpensesBreakdownCard from "@/components/expenses/expenses-breakdown-card";
import ExpensesFinCalendar from "@/components/expenses/expenses-fin-calendar";
import ExpensesInventoryTable from "@/components/expenses/expenses-inventory-table";
import {
  computeExpenseBreakdown,
  computeExpensePageKpis,
  filterExpensesTable,
  type ExpensePeriodMode,
  type ExpenseTableFilters,
} from "@/lib/expenses/expense-page-calculations";
import type { ExpenseDetail } from "@/lib/expenses/types";
import type { ExpenseFormType } from "@/lib/expenses/form-types";
import { useAdminQuickActionsOptional } from "@/lib/portal/admin-quick-actions-context";

const ExpenseDetailPanel = dynamic(
  () => import("@/components/expenses/expense-detail-panel"),
  { ssr: false },
);

type Props = {
  expenses: ExpenseDetail[];
  defaultOpen?: boolean;
  expenseType?: ExpenseFormType;
};

const DEFAULT_FILTERS: ExpenseTableFilters = {
  search: "",
  category: "all",
  status: "all",
  frequency: "all",
};

export default function ExpensesPageContent({
  expenses,
  defaultOpen = false,
  expenseType = "general",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [periodMode, setPeriodMode] = useState<ExpensePeriodMode>("year");
  const [filters, setFilters] = useState<ExpenseTableFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseDetail | null>(null);
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

  useEffect(() => {
    if (useGlobalAdd) return;
    setAddOpen(urlAddOpen);
  }, [urlAddOpen, useGlobalAdd]);

  const filteredExpenses = useMemo(
    () => filterExpensesTable(expenses, filters, year, month, periodMode),
    [expenses, filters, year, month, periodMode],
  );

  const kpis = useMemo(
    () => computeExpensePageKpis(expenses, year, month, periodMode),
    [expenses, year, month, periodMode],
  );

  const breakdown = useMemo(
    () => computeExpenseBreakdown(expenses, year, month, periodMode),
    [expenses, year, month, periodMode],
  );

  const selectedExpense = useMemo(
    () => expenses.find((expense) => expense.id === selectedId) ?? null,
    [expenses, selectedId],
  );

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

  const handleRequestAdd = () => {
    if (adminQuickActions) {
      adminQuickActions.triggerAddExpense(urlExpenseType);
      return;
    }
    handleAddOpenChange(true);
  };

  const handleExpenseDeleted = useCallback(() => {
    setSelectedId(null);
    setEditingExpense(null);
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
          <div className="mx-auto w-full max-w-[1320px]">
            <section className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  FINANCIALS
                </div>
                <h1 className="mt-1 text-[26px] font-extrabold tracking-[0.04em] text-white">
                  EXPENSES
                </h1>
              </div>
              <p className="text-[12.5px] text-slate-500">
                — {expenses.length} expenses tracked
              </p>
            </section>

            <ExpensesFinCalendar
              year={year}
              month={month}
              mode={periodMode}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onModeChange={setPeriodMode}
            />

            <ExpenseStatsCards kpis={kpis} />

            <ExpensesBreakdownCard
              buckets={breakdown.buckets}
              total={breakdown.total}
            />

            <ExpensesInventoryTable
              expenses={filteredExpenses}
              totalCount={expenses.length}
              filters={filters}
              onFiltersChange={setFilters}
              onSelect={(expense) =>
                setSelectedId((prev) => (prev === expense.id ? null : expense.id))
              }
              onEdit={setEditingExpense}
              onRequestAdd={handleRequestAdd}
              loading={isPending}
            />
          </div>
        </div>

        {selectedExpense && !addOpen && !editingExpense && (
          <ExpenseDetailPanel
            expense={selectedExpense}
            onClose={() => setSelectedId(null)}
            onDeleted={handleExpenseDeleted}
            onEdit={() => setEditingExpense(selectedExpense)}
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

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) {
              setEditingExpense(null);
              startTransition(() => router.refresh());
            }
          }}
          onDeleted={handleExpenseDeleted}
        />
      )}
    </div>
  );
}
