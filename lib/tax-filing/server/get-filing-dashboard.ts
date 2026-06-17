"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import {
  getFilingPeriods,
  getUpcomingPeriod,
  getTaxSettings,
  getUpcomingReminders,
} from "@/services/tax-filing.service";

export type FilingDashboardData = {
  settings: {
    state: string | null;
    frequency: string;
    reminderDays: number;
  } | null;
  periods: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    dueDate: string;
    status: string;
    vehicleCount: number;
    totalTaxEntered: number;
  }>;
  upcomingPeriod: {
    id: string;
    name: string;
    dueDate: string;
    status: string;
  } | null;
  reminders: Array<{
    periodId: string;
    periodName: string;
    dueDate: string;
    daysUntilDue: number;
    vehicleCount: number;
    status: string;
  }>;
};

export async function getFilingDashboard(): Promise<FilingDashboardData> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { settings: null, periods: [], upcomingPeriod: null, reminders: [] };
  }

  const { dealershipId } = auth.user;

  const [settings, periods, upcomingPeriod, reminders] = await Promise.all([
    getTaxSettings(dealershipId),
    getFilingPeriods(dealershipId),
    getUpcomingPeriod(dealershipId),
    getUpcomingReminders(dealershipId),
  ]);

  return {
    settings: settings
      ? {
          state: settings.state,
          frequency: settings.filingFrequency,
          reminderDays: settings.reminderDays,
        }
      : null,
    periods: periods.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      dueDate: p.dueDate,
      status: p.status,
      vehicleCount: p.vehicleCount,
      totalTaxEntered: p.totalTaxEntered,
    })),
    upcomingPeriod: upcomingPeriod
      ? {
          id: upcomingPeriod.id,
          name: upcomingPeriod.name,
          dueDate: upcomingPeriod.dueDate,
          status: upcomingPeriod.status,
        }
      : null,
    reminders: reminders.map((r) => ({
      periodId: r.periodId,
      periodName: r.periodName,
      dueDate: r.dueDate,
      daysUntilDue: r.daysUntilDue,
      vehicleCount: r.vehicleCount,
      status: r.status,
    })),
  };
}
