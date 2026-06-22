"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type SortDirection = "asc" | "desc";

function parseNumericValue(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned || cleaned === "-" || cleaned === ".") return 0;
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatTotalValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getColumnNumericValue<T extends Record<string, unknown>>(
  row: T,
  column: Column<T>,
): number {
  const raw = column.accessor
    ? column.accessor(row)
    : (row[column.key] as unknown);
  return parseNumericValue(raw);
}

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  accessor?: (row: T) => string | number;
  cell?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  pageSize?: number;
  addPagination?: boolean;
  enableSelection?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  activeRowKey?: string | number | null;
  paginationSummaryLabel?: string;
  loading?: boolean;
  Total?: boolean;
  TotalColumns?: number[];
  totalRowLabel?: string;
  totalColumnClassNames?: Partial<Record<number, string>>;
}

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

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  pageSize = 10,
  addPagination = false,
  enableSelection = false,
  emptyMessage = "No data available.",
  onRowClick,
  activeRowKey = null,
  paginationSummaryLabel = "items",
  loading = false,
  Total = false,
  TotalColumns = [],
  totalRowLabel = "Total",
  totalColumnClassNames = {},
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const column = columns.find((c) => c.key === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor
        ? column.accessor(a as T)
        : (a[sortConfig.key] as string | number);
      const bVal = column.accessor
        ? column.accessor(b as T)
        : (b[sortConfig.key] as string | number);
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageData = useMemo(
    () =>
      sortedData.slice(
        safePageIndex * pageSize,
        (safePageIndex + 1) * pageSize,
      ),
    [sortedData, safePageIndex, pageSize],
  );

  const handleSort = useCallback((key: string) => {
    setPageIndex(0);
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  }, []);

  const toggleSelect = useCallback((key: string | number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (pageData.length === 0) return;
    setSelectedKeys((prev) => {
      const allSelected = pageData.every((row) =>
        prev.has(row[rowKey] as string | number),
      );
      if (allSelected) return new Set();
      return new Set(pageData.map((row) => row[rowKey] as string | number));
    });
  }, [pageData, rowKey]);

  const selectedCount = selectedKeys.size;

  const table = useMemo(
    () => ({
      previousPage: () => setPageIndex((p) => Math.max(0, p - 1)),
      nextPage: () => setPageIndex((p) => Math.min(pageCount - 1, p + 1)),
      setPageIndex: (index: number) =>
        setPageIndex(Math.min(index, pageCount - 1)),
      getCanPreviousPage: () => safePageIndex > 0,
      getCanNextPage: () => safePageIndex < pageCount - 1,
      getSelectedRowModel: () => ({
        rows: new Array(selectedCount),
      }),
      getRowModel: () => ({
        rows: new Array(pageData.length),
      }),
    }),
    [pageCount, safePageIndex, selectedCount, pageData.length],
  );

  const colSpan = columns.length + (enableSelection ? 1 : 0);

  const totalColumnSet = useMemo(
    () => new Set(TotalColumns.filter((index) => index >= 0 && index < columns.length)),
    [TotalColumns, columns.length],
  );

  const columnTotals = useMemo(() => {
    if (!Total || totalColumnSet.size === 0 || sortedData.length === 0) {
      return new Map<number, number>();
    }

    const totals = new Map<number, number>();
    for (const index of totalColumnSet) {
      const column = columns[index];
      if (!column) continue;
      const sum = sortedData.reduce(
        (acc, row) => acc + getColumnNumericValue(row as T, column),
        0,
      );
      totals.set(index, sum);
    }
    return totals;
  }, [Total, totalColumnSet, sortedData, columns]);

  const showTotalRow =
    Total && sortedData.length > 0 && !loading && totalColumnSet.size > 0;

  return (
    <div className="w-full border border-slate-800 bg-card rounded-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full text-[11.5px]">
          <thead className="text-slate-500 bg-background/5">
            <tr className="border-b border-slate-800">
              {enableSelection && (
                <th className="w-10 px-1.5 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      pageData.length > 0 &&
                      pageData.every((row) =>
                        selectedKeys.has(row[rowKey] as string | number),
                      )
                    }
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-1.5 py-2 text-left font-medium whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none",
                    col.headerClassName,
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortConfig?.key === col.key ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-slate-300" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-slate-300" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse border-b border-slate-800/60 last:border-0">
                  {enableSelection && (
                    <td className="w-10 px-1.5 py-2.5">
                      <div className="h-3.5 w-3.5 rounded bg-slate-800" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-1.5 py-2.5", col.cellClassName)}
                    >
                      <div className="h-3.5 w-3/4 rounded bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-1.5 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const key = row[rowKey] as string | number;
                const isActive = activeRowKey != null && activeRowKey === key;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row as T)}
                    className={cn(
                      "border-b border-slate-800/60 bg-card transition last:border-0",
                      onRowClick && "cursor-pointer",
                      isActive
                        ? "bg-blue-500/10 hover:bg-blue-500/10"
                        : "hover:bg-slate-800/20",
                      selectedKeys.has(key) && !isActive && "bg-slate-800/30",
                    )}
                  >
                    {enableSelection && (
                      <td className="w-10 px-1.5 py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(key)}
                          onChange={() => toggleSelect(key)}
                          className="h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-1.5 py-2.5 whitespace-nowrap",
                          col.cellClassName,
                        )}
                      >
                        {col.cell
                          ? col.cell(row as T)
                          : (row[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
          {showTotalRow && (
            <tfoot className="border-t border-slate-800">
              <tr>
                {enableSelection && <td className="w-10 px-1.5 py-2.5" />}
                {columns.map((col, index) => (
                  <td
                    key={`total-${col.key}`}
                    className={cn(
                      "px-1.5 py-2.5 whitespace-nowrap font-semibold text-white",
                      col.cellClassName,
                      totalColumnClassNames[index],
                    )}
                  >
                    {index === 0
                      ? totalRowLabel
                      : totalColumnSet.has(index)
                        ? formatTotalValue(columnTotals.get(index) ?? 0)
                        : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {(addPagination || enableSelection) && (
        <div className="mt-0 border-t border-slate-800 px-3 py-3 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {addPagination && sortedData.length > 0 && (
            <span className="text-[13px] text-slate-500">
              Showing {safePageIndex * pageSize + 1} to{" "}
              {Math.min((safePageIndex + 1) * pageSize, sortedData.length)} of{" "}
              {sortedData.length.toLocaleString()} {paginationSummaryLabel}
            </span>
          )}

          {enableSelection && (
            <span className="flex-1 text-xs text-muted-foreground">
              {table.getSelectedRowModel().rows.length} of{" "}
              {table.getRowModel().rows.length} row(s) selected.
            </span>
          )}

          {addPagination && pageCount > 1 && (
            <div className="sm:ml-auto flex justify-end flex-1">
              <Pagination className="sm:ml-auto flex justify-end flex-1">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        table.previousPage();
                      }}
                      className={cn(
                        !table.getCanPreviousPage()
                          ? "pointer-events-none opacity-50"
                          : "",
                          "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white")
                      }
                    />
                  </PaginationItem>

                  {getPaginationRange(safePageIndex, pageCount).map(
                    (item, index) =>
                      item === "..." ? (
                        <PaginationItem key={`...-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === safePageIndex}
                            className={`h-8 w-8 rounded-md border text-sm font-medium transition-all duration-200 ${
                              item === safePageIndex
                                ? "border-slate-800 bg-slate-800 text-white shadow-md"
                                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              table.setPageIndex(item);
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
                        table.nextPage();
                      }}
                      className={cn(
                        !table.getCanNextPage()
                          ? "pointer-events-none opacity-50"
                          : "",
                          "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white")
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
