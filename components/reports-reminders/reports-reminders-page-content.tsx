"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { filterReminders } from "@/lib/reminders/filter-reminders";
import { DEFAULT_REMINDERS_FILTERS } from "@/lib/reminders/types";
import type { RemindersReport } from "@/lib/reminders/types";
import {
  DEFAULT_REPORTS_FILTERS,
  type ReportsDrilldownPayload,
  type ReportsDrilldownType,
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
import ReportsDetailSheet from "./reports-detail-sheet";
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
  const [liveReport, setLiveReport] = useState(report);
  const [liveReminders, setLiveReminders] = useState(reminders);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [isRefreshing, startRefresh] = useTransition();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ReportsDrilldownType | null>(null);
  const [drilldown, setDrilldown] = useState<ReportsDrilldownPayload | null>(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState<string | null>(null);

  const filteredReminders = useMemo(
    () => filterReminders(reminderFilters, liveReminders),
    [reminderFilters, liveReminders],
  );

  const handleSearchChange = useCallback((searchQuery: string) => {
    setReminderFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const queryString = useMemo(
    () => buildReportsQuery(reportFilters),
    [reportFilters],
  );

  useEffect(() => {
    startRefresh(async () => {
      setRefreshError(null);
      try {
        const response = await fetch(`/api/reports-reminders?${queryString}`);
        if (!response.ok) throw new Error("Unable to load report data");
        const data = (await response.json()) as {
          report: ReportsRemindersMock;
          reminders: RemindersReport;
        };
        setLiveReport(data.report);
        setLiveReminders(data.reminders);
      } catch (error) {
        setRefreshError(error instanceof Error ? error.message : "Unable to load report data");
      }
    });
  }, [queryString]);

  const openDrilldown = useCallback(
    async (type: ReportsDrilldownType) => {
      setActiveType(type);
      setDrilldown(null);
      setDrilldownError(null);
      setDrilldownLoading(true);
      try {
        const response = await fetch(
          `/api/reports-reminders/drilldown?type=${type}&${buildReportsQuery(reportFilters)}`,
        );
        if (!response.ok) throw new Error("Unable to load drill-down data");
        setDrilldown((await response.json()) as ReportsDrilldownPayload);
      } catch (error) {
        setDrilldownError(error instanceof Error ? error.message : "Unable to load drill-down data");
      } finally {
        setDrilldownLoading(false);
      }
    },
    [reportFilters],
  );

  return (
    <div className="relative">
      <div className="flex items-start gap-3.5">
        <div className="min-w-0 flex-1">
          <ReportsRemindersHeader />

          <ReportsRemindersFilters
            filters={reportFilters}
            options={liveReport.filterOptions}
            onChange={setReportFilters}
          />

          {refreshError && (
            <div className="mb-3.5 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
              {refreshError}
            </div>
          )}

          {isRefreshing && (
            <div className="mb-3.5 inline-flex items-center gap-2 text-[11px] text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refreshing report data
            </div>
          )}

          <ReportsKpiRow kpis={liveReport.kpis} onOpen={openDrilldown} />

          <ReportsGrid
            report={liveReport}
            reminderKpis={filteredReminders.kpis}
            onOpen={openDrilldown}
          />
        </div>

        <ReportsSidebar
          report={liveReport}
          filters={reportFilters}
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
              suggestions={liveReport.aiSuggestions}
              filters={reportFilters}
              onClose={() => setAiPanelOpen(false)}
            />
            <StickyNotesCard notes={liveReport.stickyNotes} />
          </div>
        </>
      )}

      <ReportsDetailSheet
        open={activeType !== null}
        loading={drilldownLoading}
        error={drilldownError}
        payload={drilldown}
        onOpenChange={(open) => {
          if (!open) setActiveType(null);
        }}
      />
    </div>
  );
}

function buildReportsQuery(filters: ReportsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  return params.toString();
}
