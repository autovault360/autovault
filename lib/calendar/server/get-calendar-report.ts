"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { createClient } from "@/lib/supabase/server";
import { CALENDAR_MOCK_REPORT } from "../mock-data";
import type { CalendarFilterOptions, CalendarReport } from "../types";
import { buildCalendarReportForDealership } from "./build-calendar-report";

export async function getCalendarReport(year?: number): Promise<CalendarReport> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return {
      ...CALENDAR_MOCK_REPORT,
      soldVehicleRows: [],
      purchasedVehicleRows: [],
      monthFinancials: {},
    };
  }

  const targetYear = year ?? new Date().getFullYear();

  try {
    return await buildCalendarReportForDealership(auth.user.dealershipId, targetYear);
  } catch (err) {
    console.warn("getCalendarReport fallback to mock:", err);
    return {
      ...CALENDAR_MOCK_REPORT,
      soldVehicleRows: [],
      purchasedVehicleRows: [],
      monthFinancials: {},
    };
  }
}

export async function getCalendarFilterOptions(): Promise<CalendarFilterOptions> {
  const auth = await authenticateUser();
  const defaults: CalendarFilterOptions = {
    salesReps: [{ value: "all", label: "All Sales Reps" }],
    locations: [{ value: "all", label: "All Locations" }],
  };

  if (!auth.ok) return defaults;

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const [usersResult, locationsResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name")
      .eq("dealership_id", dealershipId)
      .eq("is_active", true)
      .in("role", ["sales_rep", "manager", "owner"])
      .order("full_name"),
    supabase
      .from("vehicles")
      .select("lot_location")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .not("lot_location", "is", null),
  ]);

  const salesReps = [
    { value: "all", label: "All Sales Reps" },
    ...(usersResult.data ?? []).map((u) => ({
      value: u.id as string,
      label: (u.full_name as string) ?? "Unknown",
    })),
  ];

  const locationSet = new Set<string>();
  for (const row of locationsResult.data ?? []) {
    const loc = row.lot_location as string | null;
    if (loc?.trim()) locationSet.add(loc.trim());
  }

  const locations = [
    { value: "all", label: "All Locations" },
    ...[...locationSet].sort().map((loc) => ({ value: loc, label: loc })),
  ];

  return { salesReps, locations };
}
