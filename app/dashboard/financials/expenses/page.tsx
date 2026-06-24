import type { Metadata } from "next";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { fetchCpaExpenses } from "@/lib/cpa/server/expenses/fetch-cpa-expenses";
import ExpensesPage from "@/components/financials/expenses-page";

export const metadata: Metadata = {
  title: "Expense Category Report | Admin Dashboard",
  description: "Operating expense breakdown and category reporting.",
};

export default async function AdminExpensesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to authenticate.
      </div>
    );
  }

  const now = new Date();
  const data = await fetchCpaExpenses(auth.dealershipId, {
    view: "monthly",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return <ExpensesPage data={data} />;
}
