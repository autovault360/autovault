"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import type { ExpenseStats } from "../types";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function pctChange(current: number, previous: number): {
  text: string;
  color: "green" | "red";
} {
  if (previous === 0) {
    return { text: "— vs prior period", color: "green" };
  }
  const pct = ((current - previous) / previous) * 100;
  const down = pct < 0;
  return {
    text: `${down ? "↓" : "↑"} ${Math.abs(pct).toFixed(1)}% vs prior period`,
    color: down ? "red" : "green",
  };
}

async function sumDealershipExpenses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const { data } = await supabase
    .from("dealership_expenses")
    .select("amount")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("expense_date", from)
    .lte("expense_date", to);

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

async function sumVehicleExpenses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const { data } = await supabase
    .from("vehicle_expenses")
    .select("total_cost")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("repair_date", from)
    .lte("repair_date", to);

  return (data ?? []).reduce((sum, row) => sum + Number(row.total_cost), 0);
}

async function sumTotalExpenses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const [dealership, vehicle] = await Promise.all([
    sumDealershipExpenses(supabase, dealershipId, from, to),
    sumVehicleExpenses(supabase, dealershipId, from, to),
  ]);
  return dealership + vehicle;
}

async function sumDealRevenue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  from: string,
  to: string,
): Promise<number> {
  const { data } = await supabase
    .from("deals")
    .select("total_collected")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("sale_date", from)
    .lte("sale_date", to);

  return (data ?? []).reduce((sum, row) => sum + Number(row.total_collected), 0);
}

const EMPTY_STATS: ExpenseStats = {
  totalExpensesMtd: 0,
  totalExpensesMtdDelta: "—",
  totalExpensesMtdDeltaColor: "green",
  totalExpensesYtd: 0,
  totalExpensesYtdDelta: "—",
  totalExpensesYtdDeltaColor: "green",
  averageDailyExpense: 0,
  averageDailyExpenseDelta: "—",
  averageDailyExpenseDeltaColor: "green",
  revenuePercentMtd: 0,
  revenuePercentMtdDelta: "—",
  revenuePercentMtdDeltaColor: "green",
};

export async function computeExpenseStats(): Promise<ExpenseStats> {
  const auth = await authenticateUser();
  if (!auth.ok) return EMPTY_STATS;

  const supabase = await createClient();
  const { dealershipId } = auth.user;
  const now = new Date();

  const mtdStart = formatDate(startOfMonth(now));
  const mtdEnd = formatDate(now);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const prevMtdStart = formatDate(startOfMonth(prevMonthEnd));
  const prevMtdEnd = formatDate(prevMonthEnd);

  const ytdStart = formatDate(startOfYear(now));
  const ytdEnd = formatDate(now);
  const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31);
  const prevYtdStart = formatDate(startOfYear(prevYearEnd));
  const prevYtdEnd = formatDate(prevYearEnd);

  const [
    mtdTotal,
    prevMtdTotal,
    ytdTotal,
    prevYtdTotal,
    mtdRevenue,
    prevMtdRevenue,
  ] = await Promise.all([
    sumTotalExpenses(supabase, dealershipId, mtdStart, mtdEnd),
    sumTotalExpenses(supabase, dealershipId, prevMtdStart, prevMtdEnd),
    sumTotalExpenses(supabase, dealershipId, ytdStart, ytdEnd),
    sumTotalExpenses(supabase, dealershipId, prevYtdStart, prevYtdEnd),
    sumDealRevenue(supabase, dealershipId, mtdStart, mtdEnd),
    sumDealRevenue(supabase, dealershipId, prevMtdStart, prevMtdEnd),
  ]);

  const daysInMtd = now.getDate() || 1;
  const prevDaysInMtd = prevMonthEnd.getDate() || 1;
  const avgDaily = mtdTotal / daysInMtd;
  const prevAvgDaily = prevMtdTotal / prevDaysInMtd;

  const revenuePct = mtdRevenue > 0 ? (mtdTotal / mtdRevenue) * 100 : 0;
  const prevRevenuePct =
    prevMtdRevenue > 0 ? (prevMtdTotal / prevMtdRevenue) * 100 : 0;

  const mtdDelta = pctChange(mtdTotal, prevMtdTotal);
  const ytdDelta = pctChange(ytdTotal, prevYtdTotal);
  const avgDelta = pctChange(avgDaily, prevAvgDaily);
  const revDelta = pctChange(revenuePct, prevRevenuePct);

  return {
    totalExpensesMtd: mtdTotal,
    totalExpensesMtdDelta: mtdDelta.text,
    totalExpensesMtdDeltaColor: mtdDelta.color,
    totalExpensesYtd: ytdTotal,
    totalExpensesYtdDelta: ytdDelta.text,
    totalExpensesYtdDeltaColor: ytdDelta.color,
    averageDailyExpense: avgDaily,
    averageDailyExpenseDelta: avgDelta.text,
    averageDailyExpenseDeltaColor: avgDelta.color,
    revenuePercentMtd: revenuePct,
    revenuePercentMtdDelta: revDelta.text,
    revenuePercentMtdDeltaColor: revDelta.color,
  };
}
