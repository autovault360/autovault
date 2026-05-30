"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExpenseDetail } from "@/lib/expenses/types";
import {
  formatCategory,
  formatCurrency,
  formatDisplayDate,
  formatDateTime,
} from "@/lib/expenses/types";
import { deleteExpense } from "@/lib/expenses/server/delete-expense";
import ExpenseCategoryBadge from "./expense-category-badge";

export default function ExpenseDetailPanel({
  expense,
  onClose,
  onDeleted,
}: {
  expense: ExpenseDetail;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const linkedVehicleLabel = expense.linkedVehicle
    ? expense.stockNumber
      ? `${expense.linkedVehicle} · Stock #${expense.stockNumber}`
      : expense.linkedVehicle
    : "—";

  const handleDelete = () => {
    if (!confirm("Delete this expense? This action cannot be undone.")) return;

    setDeleting(true);
    startTransition(async () => {
      const result = await deleteExpense({
        expenseKind: expense.expenseKind,
        expenseId: expense.id,
      });
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Expense deleted.");
      onDeleted?.();
      onClose();
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "flex w-[430px] shrink-0 flex-col",
          "border border-slate-800/60 bg-[#0b1322] p-4 text-slate-200",
          "rounded-xl overflow-hidden shadow-2xl",
          "sticky top-4 z-50",
          "h-[calc(100vh-2rem)]",
          "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-full max-lg:max-w-[430px] max-lg:rounded-none",
        )}
      >
        <div className="relative shrink-0 pb-4 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            aria-label="Close expense details"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-[13px] font-semibold text-white">Expense Details</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <ExpenseCategoryBadge category={expense.category} />
              <h3 className="mt-2.5 text-[17px] font-bold leading-snug text-white">
                {expense.title}
              </h3>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[22px] font-bold text-white">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="mb-1 text-[10.5px] text-slate-500">Total Amount</span>
              </div>
              {expense.linkedVehicle && (
                <p className="mt-1 text-[12px] text-slate-400">{expense.linkedVehicle}</p>
              )}
            </div>

            {expense.receiptImageUrl && (
              <div>
                <div className="overflow-hidden rounded-lg border border-slate-700/60 bg-white p-3">
                  <Image
                    src={expense.receiptImageUrl}
                    alt={`Receipt from ${expense.vendor}`}
                    width={320}
                    height={420}
                    className="mx-auto h-auto w-full max-w-[280px]"
                    unoptimized
                  />
                </div>
                <a
                  href={expense.receiptImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-blue-400 transition hover:text-blue-300"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  View Full Size
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-lg border border-slate-800/80 bg-[#0b121f]/40 p-3.5">
              <DetailField label="Date" value={formatDisplayDate(expense.date)} />

              {expense.expenseKind === "vehicle" ? (
                <DetailField label="Type" value={expense.expenseSubcategory ?? "—"} />
              ) : (
                <DetailField label="Category" value={formatCategory(expense.category)} />
              )}

              <DetailField label="Amount" value={formatCurrency(expense.amount)} />
              <DetailField label="Vendor" value={expense.vendor} />
              <DetailField label="Linked Vehicle" value={linkedVehicleLabel} />
              <DetailField label="Transaction ID" value={expense.transactionId} />
              <DetailField label="Payment Method" value={expense.paymentMethod} />
              <DetailField
                label="Receipt Uploaded"
                value={formatDateTime(expense.receiptUploadedAt)}
              />
              <DetailField label="Notes" value={expense.notes ?? "—"} />
              <DetailField label="Added By" value={expense.addedBy} />
              <DetailField label="Description" value={expense.description} className="col-span-2" />
              <DetailField label="Created At" value={formatDateTime(expense.createdAt)} className="col-span-2" />
            </div>
          </div>
        </div>

        <div className="mt-4 shrink-0 flex gap-2 border-t border-slate-800 pt-4">
          <Button
            type="button"
            className="flex-1 bg-blue-600 hover:bg-blue-500"
            disabled
            title="Edit coming soon"
          >
            Edit Expense
          </Button>
          <Button
            type="button"
            theme="dark"
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Expense"}
          </Button>
        </div>
      </aside>
    </>
  );
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-[11.5px] text-slate-200">{value}</div>
    </div>
  );
}
