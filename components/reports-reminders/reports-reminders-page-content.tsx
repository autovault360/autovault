"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { filterReminders } from "@/lib/reminders/filter-reminders";
import { DEFAULT_REMINDERS_FILTERS } from "@/lib/reminders/types";
import type { RemindersReport } from "@/lib/reminders/types";
import {
  DEFAULT_REPORTS_FILTERS,
  type ReportsFilters,
  type ReportsRemindersMock,
} from "@/lib/reports-reminders/types";
import ReportsRemindersHeader from "./reports-reminders-header";
import ReportsRemindersFilters from "./reports-reminders-filters";
import ReportsKpiRow from "./reports-kpi-row";
import ReportsGrid from "./reports-grid";
import ReportsSidebar from "./reports-sidebar";
import ReportsAiAssistant from "./reports-ai-assistant";
import StickyNotesCard from "./sticky-notes-card";
import { cn } from "@/lib/utils";
import { REPORTS_SIDEBAR_WIDTH_CLASS } from "./reports-constants";

export default function ReportsRemindersPageContent({
  report,
  reminders,
}: {
  report: ReportsRemindersMock;
  reminders: RemindersReport;
}) {
  const [reminderFilters, setReminderFilters] = useState(
    DEFAULT_REMINDERS_FILTERS,
  );
  const [reportFilters, setReportFilters] = useState<ReportsFilters>(
    DEFAULT_REPORTS_FILTERS,
  );
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const filteredReminders = useMemo(
    () => filterReminders(reminderFilters, reminders),
    [reminderFilters, reminders],
  );

  const handleSearchChange = useCallback((searchQuery: string) => {
    setReminderFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  return (
    <div className="relative">
      <AdminHeader
        searchValue={reminderFilters.searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search VIN, Stock #, Customer, Deal, or Tag..."
      />

      <div className="flex items-start gap-3.5">
        <div className="min-w-0 flex-1">
          <ReportsRemindersHeader />

          <ReportsRemindersFilters
            filters={reportFilters}
            onChange={setReportFilters}
          />

          <ReportsKpiRow kpis={report.kpis} />

          <ReportsGrid
            report={report}
            reminderKpis={filteredReminders.kpis}
          />
        </div>

        <ReportsSidebar
          report={report}
          aiOpen={aiPanelOpen}
          onAiOpenChange={setAiPanelOpen}
        />
      </div>

      {!aiPanelOpen && (
        <button
          type="button"
          onClick={() => setAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-700 bg-[#0e1626] px-4 py-2.5 text-[12px] font-medium text-slate-200 shadow-lg transition hover:border-slate-600 hover:bg-[#111c30] xl:hidden"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          AI Report Assistant
        </button>
      )}

      {aiPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 xl:hidden"
            onClick={() => setAiPanelOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex flex-col gap-3.5 overflow-y-auto border-l border-slate-800 bg-[#010d19] p-3.5 xl:hidden",
              REPORTS_SIDEBAR_WIDTH_CLASS,
            )}
          >
            <ReportsAiAssistant
              suggestions={report.aiSuggestions}
              onClose={() => setAiPanelOpen(false)}
            />
            <StickyNotesCard notes={report.stickyNotes} />
          </div>
        </>
      )}
    </div>
  );
}
