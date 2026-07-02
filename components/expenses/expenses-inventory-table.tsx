"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import ExpenseCategoryChip from "@/components/expenses/expense-category-chip";
import {
  formatFrequencyLabel,
  isExpenseOverdue,
  type ExpenseTableFilters,
} from "@/lib/expenses/expense-page-calculations";
import { updateExpensePaymentStatus } from "@/lib/expenses/server/update-expense-payment-status";
import {
  EXPENSE_CATEGORIES,
  formatCategory,
  formatCurrency,
  formatDisplayDate,
  type ExpenseDetail,
} from "@/lib/expenses/types";

type Props = {
  expenses: ExpenseDetail[];
  totalCount: number;
  filters: ExpenseTableFilters;
  onFiltersChange: (filters: ExpenseTableFilters) => void;
  onSelect: (expense: ExpenseDetail) => void;
  onEdit: (expense: ExpenseDetail) => void;
  onRequestAdd: () => void;
  loading?: boolean;
};

function getPaginationRange(
  currentPage: number,
  pageCount: number,
): (number | "...")[] {
  const range: (number | "...")[] = [];
  const delta = 2;
  const left = Math.max(0, currentPage - delta);
  const right = Math.min(pageCount - 1, currentPage + delta);

  if (left > 0) {
    range.push(0);
    if (left > 1) range.push("...");
  }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < pageCount - 1) {
    if (right < pageCount - 2) range.push("...");
    range.push(pageCount - 1);
  }
  return range;
}

export default function ExpensesInventoryTable({
  expenses,
  totalCount,
  filters,
  onFiltersChange,
  onSelect,
  onEdit,
  onRequestAdd,
  loading = false,
}: Props) {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [gridLines, setGridLines] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    setPageIndex(0);
  }, [expenses, filters]);

  const pageCount = Math.max(1, Math.ceil(expenses.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageStart = safePageIndex * pageSize;
  const pageRows = expenses.slice(pageStart, pageStart + pageSize);
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const filterTag = useMemo(() => {
    const parts: string[] = [];
    if (filters.category !== "all") {
      parts.push(formatCategory(filters.category));
    }
    if (filters.status !== "all") {
      parts.push(filters.status === "paid" ? "Paid" : "Unpaid");
    }
    if (filters.frequency !== "all") {
      parts.push(filters.frequency === "recurring" ? "Recurring" : "One-time");
    }
    if (filters.search.trim()) {
      parts.push(`"${filters.search.trim()}"`);
    }
    if (parts.length === 0) return `Showing ${expenses.length} of ${totalCount} expenses`;
    return `Showing ${expenses.length} of ${totalCount} expenses · ${parts.join(" · ")}`;
  }, [expenses.length, filters, totalCount]);

  const handleStatusChange = async (
    expense: ExpenseDetail,
    nextStatus: "paid" | "unpaid",
  ) => {
    setStatusUpdating(expense.id);
    const result = await updateExpensePaymentStatus(
      expense.expenseKind,
      expense.id,
      nextStatus,
    );
    setStatusUpdating(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  };

  const cellBorder = gridLines ? "border border-slate-800/80" : "";

  const handleExport = () => {
    if (expenses.length === 0) {
      toast.info("No expenses to export for the current filters.");
      return;
    }

    const headers = [
      "Expense",
      "Category",
      "Amount",
      "Due Date",
      "Frequency",
      "Status",
      "Attached Vehicle",
      "Notes",
    ];

    const rows = expenses.map((expense) => [
      expense.displayName,
      formatCategory(expense.category),
      formatCurrency(expense.amount),
      formatDisplayDate(expense.dueDate),
      formatFrequencyLabel(expense.frequency),
      expense.paymentStatus === "paid" ? "Paid" : "Unpaid",
      expense.linkedVehicle ?? "",
      expense.notes ?? "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `expenses-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="action-row mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
        <button
          type="button"
          onClick={onRequestAdd}
          className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#3aa0ff] to-[#2176d8] px-[18px] py-[11px] text-[13px] font-bold text-white shadow-[0_4px_18px_rgba(58,160,255,0.25)] transition hover:-translate-y-px"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
        <p className="max-w-[620px] text-right text-[12px] leading-relaxed text-slate-500">
          Log recurring bills and one-time costs. Attaching a vehicle cost updates that
          car&apos;s profit &amp; loss automatically.
        </p>
      </div>

      <div className="mb-3.5 flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center">
        <input
          type="text"
          placeholder="Filter by expense, vehicle, or note..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="h-[38px] w-full rounded-[9px] border border-slate-800 bg-card px-3 text-[12.5px] text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500 lg:min-w-[220px] lg:w-auto lg:flex-none"
        />

        <FilterSelect
          value={filters.category}
          onChange={(category) =>
            onFiltersChange({
              ...filters,
              category: category as ExpenseTableFilters["category"],
            })
          }
          options={[
            { value: "all", label: "All Categories" },
            ...EXPENSE_CATEGORIES.map((category) => ({
              value: category,
              label: formatCategory(category),
            })),
          ]}
          className="h-[38px] w-full lg:w-auto lg:min-w-[150px]"
        />

        <FilterSelect
          value={filters.status}
          onChange={(status) =>
            onFiltersChange({
              ...filters,
              status: status as ExpenseTableFilters["status"],
            })
          }
          options={[
            { value: "all", label: "All Statuses" },
            { value: "paid", label: "Paid" },
            { value: "unpaid", label: "Unpaid" },
          ]}
          className="h-[38px] w-full lg:w-auto lg:min-w-[130px]"
        />

        <FilterSelect
          value={filters.frequency}
          onChange={(frequency) =>
            onFiltersChange({
              ...filters,
              frequency: frequency as ExpenseTableFilters["frequency"],
            })
          }
          options={[
            { value: "all", label: "Recurring & One-Time" },
            { value: "recurring", label: "Recurring only" },
            { value: "one_time", label: "One-time only" },
          ]}
          className="h-[38px] w-full lg:w-auto lg:min-w-[170px]"
        />

        <button
          type="button"
          onClick={() => setGridLines((value) => !value)}
          className={cn(
            "inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition lg:w-auto",
            gridLines
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-slate-800 bg-card text-slate-500 hover:border-blue-500 hover:text-blue-400",
          )}
        >
          <span
            className={cn(
              "h-[7px] w-[7px] rounded-full",
              gridLines ? "bg-blue-500" : "bg-slate-600",
            )}
          />
          Add Grid Lines
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-card px-3 text-[12px] font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-200 lg:w-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>

        <span className="text-[11px] text-slate-500 lg:ml-auto">{filterTag}</span>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-slate-800 bg-card">
        <div className="overflow-x-auto">
          <table
            className={cn(
              "min-w-[1080px] w-full text-[11.5px]",
              gridLines && "[&_td]:border [&_th]:border [&_td]:border-slate-800/80 [&_th]:border-slate-800/80",
            )}
          >
            <thead className="bg-card text-[10px] uppercase tracking-[0.08em] text-slate-500">
              <tr className="border-b border-slate-800">
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Expense
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Category
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  <span className="block">Amount</span>
                  <span className="mt-0.5 block text-[11px] font-bold normal-case tracking-normal text-red-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Due Date
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Frequency
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Status
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Attached Vehicle
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Receipt
                </th>
                <th className={cn("px-3 py-3 text-left font-semibold", cellBorder)}>
                  Notes
                </th>
                <th className={cn("px-3 py-3 text-right font-semibold", cellBorder)}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-800/50">
                    <td colSpan={10} className="px-3 py-4">
                      <div className="h-10 animate-pulse rounded bg-slate-800/60" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center">
                    <div className="text-[13px] text-slate-500">
                      No expenses match these filters.
                      <br />
                      Click <strong className="text-slate-300">Add Expense</strong> to log
                      where money is going.
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((expense) => {
                  const overdue = isExpenseOverdue(expense);
                  const isPaid = expense.paymentStatus === "paid";
                  return (
                    <tr
                      key={`${expense.expenseKind}-${expense.id}`}
                      className="border-b border-slate-800/50 transition hover:bg-slate-800/20"
                    >
                      <td className={cn("px-3 py-3", cellBorder)}>
                        <button
                          type="button"
                          onClick={() => onSelect(expense)}
                          className="group text-left"
                        >
                          <div className="text-[13px] font-bold text-white group-hover:text-blue-400">
                            {expense.displayName}
                          </div>
                          <div className="text-[11px] font-semibold text-blue-400 opacity-0 transition group-hover:opacity-100">
                            View details →
                          </div>
                        </button>
                      </td>
                      <td className={cn("px-3 py-3", cellBorder)}>
                        <ExpenseCategoryChip category={expense.category} />
                      </td>
                      <td className={cn("px-3 py-3 font-bold tabular-nums text-white", cellBorder)}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 whitespace-nowrap",
                          overdue ? "font-bold text-red-400" : "text-slate-300",
                          cellBorder,
                        )}
                      >
                        {formatDisplayDate(expense.dueDate)}
                        {overdue ? " · overdue" : ""}
                      </td>
                      <td className={cn("px-3 py-3", cellBorder)}>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            expense.isRecurring
                              ? "bg-violet-500/15 text-violet-400"
                              : "bg-slate-500/15 text-slate-400",
                          )}
                        >
                          {formatFrequencyLabel(expense.frequency)}
                        </span>
                      </td>
                      <td className={cn("px-3 py-3", cellBorder)}>
                        <select
                          value={isPaid ? "paid" : "unpaid"}
                          disabled={statusUpdating === expense.id}
                          onChange={(e) =>
                            handleStatusChange(
                              expense,
                              e.target.value as "paid" | "unpaid",
                            )
                          }
                          className={cn(
                            "rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] font-bold outline-none",
                            isPaid ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className={cn("px-3 py-3", cellBorder)}>
                        {expense.vehicleId ? (
                          <Link
                            href={`/dashboard/vehicles/${expense.vehicleId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11.5px] font-semibold text-blue-400 transition hover:bg-blue-500/20"
                          >
                            {expense.linkedVehicle}
                          </Link>
                        ) : (
                          <span className="text-[11.5px] text-slate-500">—</span>
                        )}
                      </td>
                      <td className={cn("px-3 py-3", cellBorder)}>
                        {expense.receiptImageUrl || expense.hasReceipt ? (
                          <button
                            type="button"
                            onClick={() => onEdit(expense)}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-400"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Receipt
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onEdit(expense)}
                            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-700 px-2 py-0.5 text-[11px] text-slate-500 transition hover:border-blue-500 hover:text-blue-400"
                          >
                            <Upload className="h-3 w-3" />
                            Upload
                          </button>
                        )}
                      </td>
                      <td
                        className={cn(
                          "max-w-[240px] px-3 py-3 text-[11.5px] leading-relaxed text-slate-500",
                          cellBorder,
                        )}
                      >
                        {expense.notes || "—"}
                      </td>
                      <td className={cn("px-3 py-3 text-right", cellBorder)}>
                        <button
                          type="button"
                          onClick={() => onEdit(expense)}
                          className="inline-grid h-7 w-7 place-items-center rounded-md border border-slate-700 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
                          aria-label="Edit expense"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {expenses.length > 0 && (
          <div className="flex w-full flex-col gap-3 border-t border-slate-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[13px] text-slate-500">
              Showing {pageStart + 1} to {Math.min(pageStart + pageSize, expenses.length)} of{" "}
              {expenses.length} expenses
            </span>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              <div className="flex items-center gap-2 text-[12px] text-slate-500">
                <span className="whitespace-nowrap">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger theme="dark" className="h-8 w-[72px] text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent theme="dark" align="end">
                    {[6, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} theme="dark">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pageCount > 1 && (
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPageIndex((page) => Math.max(0, page - 1));
                        }}
                        className={cn(
                          safePageIndex === 0 && "pointer-events-none opacity-50",
                          "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                        )}
                      />
                    </PaginationItem>
                    {getPaginationRange(safePageIndex, pageCount).map((item, index) =>
                      item === "..." ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === safePageIndex}
                            className={cn(
                              "h-8 w-8 rounded-md border text-sm font-medium",
                              item === safePageIndex
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              setPageIndex(item);
                            }}
                          >
                            {item + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPageIndex((page) => Math.min(pageCount - 1, page + 1));
                        }}
                        className={cn(
                          safePageIndex >= pageCount - 1 &&
                            "pointer-events-none opacity-50",
                          "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger theme="dark" className={cn("text-[12.5px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent theme="dark">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} theme="dark" className="text-[12px]">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
