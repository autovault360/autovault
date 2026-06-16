"use server";

import { getWholesaleDocumentStats } from "./get-wholesale-document-stats";
import { listWholesaleDocuments } from "./list-wholesale-documents";
import type { WholesaleDocumentsDashboardData } from "../types";

export async function getWholesaleDocumentsDashboard(): Promise<WholesaleDocumentsDashboardData> {
  const [stats, list] = await Promise.all([
    getWholesaleDocumentStats(),
    listWholesaleDocuments({ page: 1, pageSize: 6 }),
  ]);

  return { stats, list };
}
