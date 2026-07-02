import { Suspense } from "react";

import ExpensesPageContent from "@/components/expenses/expenses-page-content";
import ExpensesPageSkeleton from "@/components/expenses/expenses-skeleton";

import { getExpenses } from "@/lib/expenses/server/get-expenses";

import type { ExpenseFormType } from "@/lib/expenses/form-types";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{ add?: string; type?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const expenseType = resolved.type as ExpenseFormType | undefined;

  const [expenses] = await Promise.all([getExpenses()]);

  return (
    <Suspense fallback={<ExpensesPageSkeleton />}>
      <ExpensesPageContent
        expenses={expenses}
        defaultOpen={resolved.add === "true"}
        expenseType={expenseType}
      />
    </Suspense>
  );
}
