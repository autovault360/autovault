export type ReminderPriority = "high" | "medium" | "low";

export type ReminderStatus =
  | "overdue"
  | "due_today"
  | "due_this_week"
  | "due_this_month"
  | "completed"
  | "upcoming";

export type ReminderCategory =
  | "vehicle"
  | "deal"
  | "accounting"
  | "employee"
  | "business"
  | "custom";

export type ReminderIconColor =
  | "red"
  | "amber"
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "cyan";

export type Reminder = {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  dueDate: string;
  completed: boolean;
  iconColor: ReminderIconColor;
};

export type Payment = {
  id: string;
  name: string;
  vendor: string;
  amount: number;
  dueDate: string;
  category: string;
  statusLabel: string;
  statusTone: "orange" | "yellow" | "green" | "red";
};

export type RecurringPayment = {
  id: string;
  vendor: string;
  category: string;
  dueDate: string;
  amount: number;
  frequency: string;
};

export type CalendarEventColor =
  | "bg-red-500/80"
  | "bg-blue-500/80"
  | "bg-purple-500/80"
  | "bg-amber-500/80"
  | "bg-emerald-500/80";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: CalendarEventColor;
  type: string;
  dayIndex: number;
  spanDays: number;
};

export type ReminderCategorySummary = {
  category: ReminderCategory;
  label: string;
  count: number;
  iconColor: ReminderIconColor;
};

export type ReminderKpi = {
  id: string;
  label: string;
  count: number;
  description: string;
  color: "red" | "amber" | "purple" | "blue" | "green";
};

export type AiSuggestionIcon =
  | "clock"
  | "alert"
  | "car"
  | "dollar"
  | "repeat"
  | "file"
  | "folder"
  | "wallet";

export type AiSuggestion = {
  id: string;
  label: string;
  icon: AiSuggestionIcon;
};

export type RemindersFilters = {
  asOfDate: string;
  searchQuery: string;
  calendarWeekStart: string;
};

export type RemindersReport = {
  reminders: Reminder[];
  categories: ReminderCategorySummary[];
  upcomingPayments: Payment[];
  recurringPayments: RecurringPayment[];
  calendarEvents: CalendarEvent[];
  aiSuggestions: AiSuggestion[];
};

export type FilteredReminders = {
  kpis: ReminderKpi[];
  categories: ReminderCategorySummary[];
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  upcomingPayments: Payment[];
  recurringPayments: RecurringPayment[];
  calendarEvents: CalendarEvent[];
  totalObligations: number;
  report: RemindersReport;
};

export type ViewAllModalView =
  | "categories"
  | "upcoming"
  | "payments"
  | "overdue"
  | "calendar"
  | "recurring";

export const DEFAULT_REMINDERS_FILTERS: RemindersFilters = {
  asOfDate: "2025-05-20",
  searchQuery: "",
  calendarWeekStart: "2025-05-20",
};
