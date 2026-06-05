import type { CpaMonthlyFinancialsData, CpaMonthlyNoteItem } from "@/lib/cpa/types";
import {
  buildCpaMonthlyFinancialsData,
  noteRibbonFromCategory,
} from "./finance/build-monthly-financials";
import { listCpaNotes } from "./notes/list-notes";

export async function fetchCpaMonthlyFinancials(
  dealershipId: string,
  params: { month: number; year: number },
): Promise<CpaMonthlyFinancialsData> {
  let notes: CpaMonthlyNoteItem[] = [];

  try {
    const { notes: noteList } = await listCpaNotes(dealershipId, { status: "all" });
    notes = noteList
      .filter((n) => !n.isArchived)
      .slice(0, 3)
      .map((n) => ({
        id: n.id,
        content: n.title,
        date: new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        author: n.createdByName,
        ribbon: noteRibbonFromCategory(n.category, n.priority),
      }));
  } catch {
    notes = [];
  }

  return buildCpaMonthlyFinancialsData(dealershipId, params, notes);
}
