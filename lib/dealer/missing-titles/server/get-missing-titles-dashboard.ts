import { MISSING_TITLES_MOCK } from "../mock-data";
import type { MissingTitlesDashboardData } from "../types";

/**
 * Server entry for Missing Titles Center.
 * TODO(backend): query vehicles where title_status = pending via service layer.
 */
export async function getMissingTitlesDashboard(): Promise<MissingTitlesDashboardData> {
  return MISSING_TITLES_MOCK;
}
