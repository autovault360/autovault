import { Suspense } from "react";
import ExpensesPageContent from "@/components/expenses/expenses-page-content";
import { EXPENSES_MOCK, EXPENSE_STATS_MOCK } from "@/lib/expenses/mock-data";
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

  return (
    <Suspense fallback={null}>
      <ExpensesPageContent
        expenses={EXPENSES_MOCK}
        stats={EXPENSE_STATS_MOCK}
        defaultOpen={resolved.add === "true"}
        expenseType={expenseType}
      />
    </Suspense>
  );
}
