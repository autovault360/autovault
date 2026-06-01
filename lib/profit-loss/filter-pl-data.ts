import type { PlFilters, PlTableRow, ProfitLossReport } from "./types";
import { computeChange, formatCurrency, formatPercent } from "./types";

const EMPTY_CHANGE = "-";

function filterRowsBySearch(rows: PlTableRow[], search: string): PlTableRow[] {
  const q = search.trim().toLowerCase();
  if (!q) return rows;

  const visibleIds = new Set<string>();
  let currentSectionId: string | null = null;

  for (const row of rows) {
    if (row.kind === "section-header") {
      currentSectionId = row.id;
    }
    if (row.kind === "line-item" && row.label.toLowerCase().includes(q)) {
      if (currentSectionId) visibleIds.add(currentSectionId);
      visibleIds.add(row.id);
    }
  }

  return rows.filter((row) => {
    if (row.kind === "section-header") return visibleIds.has(row.id);
    if (row.kind === "line-item") return visibleIds.has(row.id);
    return true;
  });
}

export function applyPlFilters(
  filters: PlFilters,
  baseReport: ProfitLossReport,
): ProfitLossReport {
  const statementRows = filterRowsBySearch(baseReport.statementRows, filters.search);

  return {
    ...baseReport,
    statementRows,
  };
}

export function enrichTableRows(rows: PlTableRow[]): Array<
  PlTableRow & {
    dollarChange: number | null;
    percentChange: number | null;
    dollarChangeFormatted: string;
    percentChangeFormatted: string;
    changePositive: boolean | null;
  }
> {
  return rows.map((row) => {
    if (row.thisMonth === null || row.lastMonth === null) {
      return {
        ...row,
        dollarChange: null,
        percentChange: null,
        dollarChangeFormatted: EMPTY_CHANGE,
        percentChangeFormatted: EMPTY_CHANGE,
        changePositive: null,
      };
    }
    const { dollar, percent } = computeChange(row.thisMonth, row.lastMonth);
    const isExpenseSection =
      row.section === "cogs" || row.section === "operating_expenses";
    const changePositive = isExpenseSection ? dollar <= 0 : dollar >= 0;

    return {
      ...row,
      dollarChange: dollar,
      percentChange: percent,
      dollarChangeFormatted:
        dollar === 0 ? "$0.00" : `${dollar >= 0 ? "+" : ""}${formatCurrency(dollar)}`,
      percentChangeFormatted:
        percent === 0 ? "0.0%" : `${percent >= 0 ? "+" : ""}${formatPercent(percent)}`,
      changePositive,
    };
  });
}
