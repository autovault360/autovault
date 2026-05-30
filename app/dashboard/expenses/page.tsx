import { Suspense } from "react";

import ExpensesPageContent from "@/components/expenses/expenses-page-content";
import ExpensesPageSkeleton from "@/components/expenses/expenses-skeleton";

import { computeExpenseStats } from "@/lib/expenses/server/compute-expense-stats";

import { getExpenses } from "@/lib/expenses/server/get-expenses";

import type { ExpenseFormType } from "@/lib/expenses/form-types";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ add?: string; type?: string }>
    | { add?: string; type?: string };
}) {
  const resolved =
    searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const expenseType = resolved.type as ExpenseFormType | undefined;

  const [expenses, stats] = await Promise.all([
    getExpenses(),
    computeExpenseStats(),
  ]);

  return (
    <Suspense fallback={<ExpensesPageSkeleton />}>
      <ExpensesPageContent
        expenses={expenses}
        stats={stats}
        defaultOpen={resolved.add === "true"}
        expenseType={expenseType}
      />
    </Suspense>
  );
}
