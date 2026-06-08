"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormGrid,
  FormSection,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import { useExpenseForm } from "@/hooks/dealer/use-expense-form";
import type { ExpenseCategory, WholesaleExpense } from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  auction_fees: "Auction Fees",
  transportation: "Transportation",
  recon_repairs: "Recon / Repairs",
  storage_fees: "Storage Fees",
  dealer_fees: "Dealer Fees",
  miscellaneous: "Miscellaneous Overhead",
};

function groupExpenses(expenses: WholesaleExpense[]) {
  const groups = new Map<ExpenseCategory, WholesaleExpense[]>();
  for (const cat of Object.keys(CATEGORY_LABELS) as ExpenseCategory[]) {
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
    expandedSection,
    collapseExpanded,
    simulateSave,
    workspaceSaving,
  } = useDealerDashboard();
  const form = useExpenseForm();
  const [showForm, setShowForm] = useState(false);

  const isFormOpen = expandedSection === "expense" || showForm;

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

  const onSubmit = form.handleSubmit(async () => {
    await simulateSave();
    form.reset();
    setShowForm(false);
    collapseExpanded();
  });

  return (
    <section
      id={DEALER_SECTION_IDS.expenses}
      ref={expensesRef}
      className="scroll-mt-4"
    >
      <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <CardHead title="EXPENSE SYSTEM" />
          <Button
            type="button"
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-8 bg-emerald-600 text-[11px] hover:bg-emerald-500"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => {
            const items = grouped.get(cat) ?? [];
            const subtotal = items.reduce((s, e) => s + e.amount, 0);
            return (
              <div
                key={cat}
                className="rounded-md border border-[#1e293b] bg-[#070c14]/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wide text-[#64748b]">
                    {CATEGORY_LABELS[cat].toUpperCase()}
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
          })}
        </div>

        {isFormOpen && (
          <div className="mt-4 rounded-md border border-emerald-500/30 bg-[#070c14]/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[12px] font-bold text-white">Add Expense</h4>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  collapseExpanded();
                }}
                className="text-[11px] text-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>
            <Form {...form}>
              <form onSubmit={onSubmit}>
                <FormSection theme="dark" title="Expense Entry">
                  <FormGrid cols={3}>
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] text-[#64748b]">
                            Category
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 border-[#1e293b] bg-[#070c14]/60 text-[12px]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-[#1e293b] bg-[#0a101d]">
                              {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(
                                (cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat]}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] text-[#64748b]">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Input
                              theme="dark"
                              {...field}
                              className="h-8 border-[#1e293b] bg-[#070c14]/60"
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] text-[#64748b]">
                            Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              theme="dark"
                              mode="currency"
                              value={field.value}
                              onValueChange={field.onChange}
                              className="h-8 border-[#1e293b] bg-[#070c14]/60"
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </FormGrid>
                </FormSection>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={workspaceSaving}
                    className="h-8 bg-emerald-600 text-[12px]"
                  >
                    {workspaceSaving && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    Save Expense
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardShell>
    </section>
  );
}
