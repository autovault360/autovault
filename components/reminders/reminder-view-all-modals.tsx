"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/components/reusable/DataTable";
import type { FilteredReminders, Reminder, ViewAllModalView } from "@/lib/reminders/types";
import { formatCurrency, formatShortDate } from "@/lib/reminders/format-utils";
import ReminderPriorityBadge from "./reminder-priority-badge";
import ReminderStatusBadge from "./reminder-status-badge";
import ReminderCalendar from "./reminder-calendar";

const titles: Record<ViewAllModalView, string> = {
  categories: "All Reminders by Category",
  upcoming: "All Upcoming Reminders",
  payments: "All Upcoming Payments",
  overdue: "All Overdue Reminders",
  calendar: "Full Calendar",
  recurring: "All Recurring Payments",
};

type Props = {
  view: ViewAllModalView | null;
  filtered: FilteredReminders;
  asOfDate: string;
  calendarWeekStart: string;
  onClose: () => void;
  onWeekChange: (weekStart: string) => void;
  onThisWeek: () => void;
  onReminderClick: (reminder: Reminder) => void;
};

export default function ReminderViewAllModals({
  view,
  filtered,
  asOfDate,
  calendarWeekStart,
  onClose,
  onWeekChange,
  onThisWeek,
  onReminderClick,
}: Props) {
  return (
    <Dialog open={view != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto border-slate-700 bg-[#0e1626] text-slate-200">
        {view && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">{titles[view]}</DialogTitle>
            </DialogHeader>

            {view === "categories" && (
              <DataTable
                columns={[
                  { key: "label", header: "Category", accessor: (r) => r.label },
                  { key: "count", header: "Pending", accessor: (r) => r.count },
                ]}
                data={filtered.categories}
                rowKey="category"
                pageSize={10}
                addPagination
                emptyMessage="No categories found."
              />
            )}

            {view === "upcoming" && (
              <DataTable
                columns={[
                  { key: "title", header: "Reminder", accessor: (r) => r.title },
                  {
                    key: "description",
                    header: "Description",
                    accessor: (r) => r.description,
                  },
                  {
                    key: "dueDate",
                    header: "Due Date",
                    cell: (r) => formatShortDate(r.dueDate),
                  },
                  {
                    key: "priority",
                    header: "Priority",
                    cell: (r) => <ReminderPriorityBadge priority={r.priority} />,
                  },
                ]}
                data={filtered.upcomingReminders}
                rowKey="id"
                pageSize={10}
                addPagination
                onRowClick={onReminderClick}
                emptyMessage="No upcoming reminders."
              />
            )}

            {view === "payments" && (
              <DataTable
                columns={[
                  { key: "name", header: "Payment", accessor: (r) => r.name },
                  {
                    key: "dueDate",
                    header: "Due Date",
                    cell: (r) => formatShortDate(r.dueDate),
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    cell: (r) => formatCurrency(r.amount),
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (r) => (
                      <ReminderStatusBadge label={r.statusLabel} tone={r.statusTone} />
                    ),
                  },
                ]}
                data={filtered.upcomingPayments}
                rowKey="id"
                pageSize={10}
                addPagination
                emptyMessage="No payments found."
              />
            )}

            {view === "overdue" && (
              <DataTable
                columns={[
                  { key: "title", header: "Title", accessor: (r) => r.title },
                  {
                    key: "description",
                    header: "Description",
                    accessor: (r) => r.description,
                  },
                  {
                    key: "dueDate",
                    header: "Due Date",
                    cell: (r) => (
                      <span className="text-red-400">{formatShortDate(r.dueDate)}</span>
                    ),
                  },
                  {
                    key: "priority",
                    header: "Priority",
                    cell: (r) => <ReminderPriorityBadge priority={r.priority} />,
                  },
                ]}
                data={filtered.overdueReminders}
                rowKey="id"
                pageSize={10}
                addPagination
                emptyMessage="No overdue reminders."
              />
            )}

            {view === "calendar" && (
              <ReminderCalendar
                events={filtered.calendarEvents}
                weekStart={calendarWeekStart}
                onWeekChange={onWeekChange}
                onThisWeek={onThisWeek}
                onViewAll={() => {}}
              />
            )}

            {view === "recurring" && (
              <DataTable
                columns={[
                  { key: "vendor", header: "Vendor", accessor: (r) => r.vendor },
                  {
                    key: "category",
                    header: "Category",
                    accessor: (r) => r.category,
                  },
                  {
                    key: "dueDate",
                    header: "Due Date",
                    cell: (r) => formatShortDate(r.dueDate),
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    cell: (r) => formatCurrency(r.amount),
                  },
                  {
                    key: "frequency",
                    header: "Frequency",
                    accessor: (r) => r.frequency,
                  },
                ]}
                data={filtered.recurringPayments}
                rowKey="id"
                pageSize={10}
                addPagination
                emptyMessage="No recurring payments."
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
