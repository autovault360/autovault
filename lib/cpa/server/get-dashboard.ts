import { createClient } from "@/lib/supabase/server";
import { getCpaDashboardData } from "@/services/cpa-finance.service";
import type { CpaDashboardData, CpaViewMode } from "../types";
import { listCpaNotes } from "./notes/list-notes";

export async function fetchCpaDashboard(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaDashboardData> {
  const data = await getCpaDashboardData(dealershipId, params);

  try {
    const { notes, summary } = await listCpaNotes(dealershipId, { status: "all" });
    data.notesSummary = summary;
    data.notePreviews = notes
      .filter((n) => !n.isArchived)
      .slice(0, 3)
      .map((n) => ({
        id: n.id,
        title: n.title,
        date: new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        creator: n.createdByName,
        status: n.status,
        priority: n.priority,
      }));
  } catch {
    const supabase = await createClient();
    const { count } = await supabase
      .from("cpa_notes")
      .select("id", { count: "exact", head: true })
      .eq("dealership_id", dealershipId);
    if (count) {
      data.notesSummary.total = count;
    }
  }

  return data;
}
