import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { cn } from "@/lib/utils";

const XL_GRID_COLS: Record<number, string> = {
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  7: "xl:grid-cols-7",
  8: "xl:grid-cols-8",
};

/** Responsive KPI grid — matches wholesale Inventory Overview layout. */
export const KPI_GRID_BASE = "grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3";

export function kpiGridClass(cardCount: number, className?: string) {
  const xlCols = XL_GRID_COLS[cardCount] ?? XL_GRID_COLS[6];
  return cn(KPI_GRID_BASE, xlCols, className);
}

export const KPI_CARD_SHELL_CLASS = ADMIN_PANEL_SHELL_CLASS;

export const KPI_CARD_DEFAULT_PROPS = {
  layout: "default" as const,
  showSparkline: false as const,
  showLink: false as const,
};
