"use server";

import { DEFAULT_REPORTS_FILTERS } from "@/lib/reports-reminders/types";
import type { ReportsRemindersMock } from "@/lib/reports-reminders/types";
import type { RemindersReport } from "@/lib/reminders/types";
import { getReportsCommandCenterData } from "./report-command-center";

export async function getReportsRemindersData(): Promise<{
  report: ReportsRemindersMock;
  reminders: RemindersReport;
}> {
  return getReportsCommandCenterData(DEFAULT_REPORTS_FILTERS);
}
