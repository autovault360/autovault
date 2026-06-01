"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filterReminders } from "@/lib/reminders/filter-reminders";
import { REMINDERS_MOCK_REPORT } from "@/lib/reminders/mock-data";
import {
  DEFAULT_REMINDERS_FILTERS,
  type Reminder,
  type ViewAllModalView,
} from "@/lib/reminders/types";
import { formatShortDate } from "@/lib/reminders/format-utils";
import { formatDueStatus } from "@/lib/reminders/selectors";
import ReminderCenterHeader from "./reminder-center-header";
import ReminderKpiCards from "./reminder-kpi-cards";
import ReminderCategoriesCard from "./reminder-categories-card";
import UpcomingRemindersCard from "./upcoming-reminders-card";
import UpcomingPaymentsCard from "./upcoming-payments-card";
import OverdueRemindersCard from "./overdue-reminders-card";
import ReminderCalendar from "./reminder-calendar";
import RecurringPaymentsCard from "./recurring-payments-card";
import ReminderAiAssistant from "./reminder-ai-assistant";
import ReminderViewAllModals from "./reminder-view-all-modals";
import ReminderPriorityBadge from "./reminder-priority-badge";

export default function RemindersPageContent() {
  const [filters, setFilters] = useState(DEFAULT_REMINDERS_FILTERS);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [viewAll, setViewAll] = useState<ViewAllModalView | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const filtered = useMemo(
    () => filterReminders(filters, REMINDERS_MOCK_REPORT),
    [filters],
  );

  const handleDateChange = useCallback((asOfDate: string) => {
    setFilters((prev) => ({
      ...prev,
      asOfDate,
      calendarWeekStart: asOfDate,
    }));
  }, []);

  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const handleWeekChange = useCallback((calendarWeekStart: string) => {
    setFilters((prev) => ({ ...prev, calendarWeekStart }));
  }, []);

  const handleThisWeek = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      calendarWeekStart: prev.asOfDate,
    }));
  }, []);

  const handleViewAll = useCallback((view: ViewAllModalView) => {
    setViewAll(view);
  }, []);

  const handleReminderClick = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder);
  }, []);

  return (
    <div className="relative">
      <AdminHeader
        searchValue={filters.searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search reminders by title, category, or description..."
      />

      <div className="flex gap-3.5">
        <div className="min-w-0 flex-1">
          <ReminderCenterHeader
            asOfDate={filters.asOfDate}
            onDateChange={handleDateChange}
          />

          <ReminderKpiCards kpis={filtered.kpis} />

          <section className="mb-3.5 grid gap-3.5 xl:grid-cols-3">
            <ReminderCategoriesCard
              categories={filtered.categories}
              onViewAll={handleViewAll}
            />
            <UpcomingRemindersCard
              reminders={filtered.upcomingReminders}
              asOfDate={filters.asOfDate}
              onViewAll={handleViewAll}
              onReminderClick={handleReminderClick}
              selectedReminderId={selectedReminder?.id}
            />
            <UpcomingPaymentsCard
              payments={filtered.upcomingPayments}
              totalObligations={filtered.totalObligations}
              onViewAll={handleViewAll}
            />
          </section>

          <section className="mb-3.5 grid gap-3.5 xl:grid-cols-3">
            <OverdueRemindersCard
              reminders={filtered.overdueReminders}
              onViewAll={handleViewAll}
            />
            <ReminderCalendar
              events={filtered.calendarEvents}
              weekStart={filters.calendarWeekStart}
              onWeekChange={handleWeekChange}
              onThisWeek={handleThisWeek}
              onViewAll={handleViewAll}
            />
            <RecurringPaymentsCard
              payments={filtered.recurringPayments}
              onViewAll={handleViewAll}
            />
          </section>
        </div>

        {aiPanelOpen && (
          <ReminderAiAssistant
            suggestions={REMINDERS_MOCK_REPORT.aiSuggestions}
            filtered={filtered}
            open={aiPanelOpen}
            onOpenChange={setAiPanelOpen}
          />
        )}
      </div>

      {!aiPanelOpen && (
        <button
          type="button"
          onClick={() => setAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-700 bg-[#0e1626] px-4 py-2.5 text-[12px] font-medium text-slate-200 shadow-lg transition hover:border-slate-600 hover:bg-[#111c30]"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          AI Assistant
        </button>
      )}

      <ReminderViewAllModals
        view={viewAll}
        filtered={filtered}
        asOfDate={filters.asOfDate}
        calendarWeekStart={filters.calendarWeekStart}
        onClose={() => setViewAll(null)}
        onWeekChange={handleWeekChange}
        onThisWeek={handleThisWeek}
        onReminderClick={handleReminderClick}
      />

      <Dialog
        open={selectedReminder != null}
        onOpenChange={(open) => !open && setSelectedReminder(null)}
      >
        <DialogContent className="max-w-md border-slate-700 bg-[#0e1626] text-slate-200">
          {selectedReminder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedReminder.title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-[12.5px] text-slate-400">
                {selectedReminder.description}
              </p>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="text-slate-500">
                  Due: {formatShortDate(selectedReminder.dueDate)}
                </span>
                <span className="text-slate-500">
                  {formatDueStatus(selectedReminder.dueDate, filters.asOfDate)}
                </span>
                <ReminderPriorityBadge priority={selectedReminder.priority} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
