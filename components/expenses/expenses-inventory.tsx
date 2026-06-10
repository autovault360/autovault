"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Plus,
  FileText,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import ExpenseCategoryBadge from "./expense-category-badge";
import {
  EXPENSE_CATEGORIES,
  formatCategory,
  formatCurrency,
  formatDisplayDate,
  type ExpenseDetail,
} from "@/lib/expenses/types";

type Props = {
  expenses: ExpenseDetail[];
  selectedId: string | null;
  onSelect: (row: ExpenseDetail) => void;
  onRequestAdd?: () => void;
  loading?: boolean;
};

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-card/40 " +
  "[&_table]:min-w-[960px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-card [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-4 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-card/30";

export default function ExpensesInventory({
  expenses,
  selectedId,
  onSelect,
  onRequestAdd,
  loading = false,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return expenses.filter((expense) => {
      if (categoryFilter !== "all" && expense.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        expense.title.toLowerCase().includes(q) ||
        expense.subtitle.toLowerCase().includes(q) ||
        expense.vendor.toLowerCase().includes(q) ||
        expense.paymentMethod.toLowerCase().includes(q)
      );
    });
  }, [expenses, search, categoryFilter]);

  const columns: Column<ExpenseDetail>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      accessor: (row) => row.date,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-300">
          {formatDisplayDate(row.date)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      accessor: (row) => formatCategory(row.category),
      cell: (row) => <ExpenseCategoryBadge category={row.category} />,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      accessor: (row) => row.title,
      cell: (row) => (
        <div className="min-w-[200px] max-w-[320px]">
          <div className="truncate text-[12px] font-medium text-white">
            {row.title}
          </div>
          <div className="truncate text-[11px] text-slate-500">{row.subtitle}</div>
        </div>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      cell: (row) =>
        row.receiptImageUrl ? (
          <img
            src={row.receiptImageUrl}
            alt="Receipt"
            className="h-8 w-10 rounded-[3px] border border-slate-700 object-cover"
          />
        ) : row.hasReceipt ? (
          <FileText className="h-4 w-4 text-slate-400" aria-label="Receipt attached" />
        ) : (
          <span className="text-slate-600">...</span>
        ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      sortable: true,
      accessor: (row) => row.paymentMethod,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-300">{row.paymentMethod}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      accessor: (row) => row.amount,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <span className="whitespace-nowrap font-semibold text-white">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </div>
      ),
    },
  ];

  const handleExport = () => {
    toast.info("Export will be available when connected to the backend.");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup theme="dark" className="max-w-sm">
          <InputGroupAddon>
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] text-slate-200 placeholder:text-slate-500"
          />
        </InputGroup>

        <FilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="All Categories"
          options={[
            { value: "all", label: "All Categories" },
            ...EXPENSE_CATEGORIES.map((c) => ({
              value: c,
              label: formatCategory(c),
            })),
          ]}
          className="w-[150px]"
        />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="h-9 gap-1.5 bg-blue-600 px-3 text-[11.5px] hover:bg-blue-500"
            onClick={() =>
              onRequestAdd
                ? onRequestAdd()
                : router.push("/dashboard/expenses?add=true&type=general")
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add Expense
          </Button>

          <button
            type="button"
            onClick={handleExport}
            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11.5px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className={`py-3.5 ${TABLE_WRAPPER_CLASS}`}>
        {loading ? (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey="id"
            pageSize={10}
            addPagination
            emptyMessage="No expenses match your filters."
            onRowClick={onSelect}
            activeRowKey={selectedId}
            paginationSummaryLabel="expenses"
            loading
          />
        ) : filtered.length === 0 ? (
          <EmptyState hasExpenses={expenses.length > 0} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey="id"
            pageSize={10}
            addPagination
            emptyMessage="No expenses match your filters."
            onRowClick={onSelect}
            activeRowKey={selectedId}
            paginationSummaryLabel="expenses"
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasExpenses }: { hasExpenses: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-slate-800 bg-card/40 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-800/80">
        <Receipt className="h-6 w-6 text-slate-500" />
      </div>
      <p className="text-[13px] font-medium text-white">
        {hasExpenses ? "No expenses match your filters" : "No expenses found"}
      </p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        {hasExpenses
          ? "Try adjusting your search or category filter to find what you are looking for."
          : "Add your first expense to start tracking dealership costs."}
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger theme="dark" className={`h-9 text-[11.5px] ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent theme="dark">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[11.5px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
