import { createClient } from "@/lib/supabase/server";
import type { CustomerStats } from "../types";
import { formatCurrencyDelta, formatDelta } from "../types";
import { authenticateUser } from "./utils";

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function prevMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function prevMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return d >= start && d <= end;
}

export async function computeCustomerStats(): Promise<CustomerStats> {
  const auth = await authenticateUser();
  const empty: CustomerStats = {
    totalCustomers: 0,
    newCustomersMtd: 0,
    activeDeals: 0,
    totalSalesMtd: 0,
    totalCustomersDelta: "0% vs last month",
    totalCustomersDeltaColor: "green",
    newCustomersDelta: "0% vs last month",
    newCustomersDeltaColor: "green",
    activeDealsDelta: "0% vs last month",
    activeDealsDeltaColor: "green",
    totalSalesDelta: "0% vs last month",
    totalSalesDeltaColor: "green",
  };

  if (!auth.ok) return empty;

  const supabase = await createClient();
  const now = new Date();
  const curStart = monthStart(now);
  const curEnd = monthEnd(now);
  const prevStart = prevMonthStart(now);
  const prevEnd = prevMonthEnd(now);

  const { data: customers, error: custError } = await supabase
    .from("customers")
    .select("id, status, created_at")
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  if (custError) {
    console.warn("computeCustomerStats customers:", custError.message);
    return empty;
  }

  const { data: deals, error: dealError } = await supabase
    .from("deals")
    .select("total_collected, sale_date")
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  if (dealError) {
    console.warn("computeCustomerStats deals:", dealError.message);
    return empty;
  }

  const allCustomers = customers ?? [];
  const allDeals = deals ?? [];

  const totalCustomers = allCustomers.length;
  const newCustomersMtd = allCustomers.filter((c) =>
    inRange(c.created_at as string, curStart, curEnd),
  ).length;
  const newCustomersPrev = allCustomers.filter((c) =>
    inRange(c.created_at as string, prevStart, prevEnd),
  ).length;

  const activeDeals = allCustomers.filter(
    (c) => c.status === "active_deal",
  ).length;

  const activeDealsPrev = allCustomers.filter((c) => {
    if (c.status !== "active_deal") return false;
    return inRange(c.created_at as string, prevStart, prevEnd);
  }).length;

  const totalSalesMtd = allDeals
    .filter((d) => inRange(d.sale_date as string, curStart, curEnd))
    .reduce((sum, d) => sum + Number(d.total_collected ?? 0), 0);

  const totalSalesPrev = allDeals
    .filter((d) => inRange(d.sale_date as string, prevStart, prevEnd))
    .reduce((sum, d) => sum + Number(d.total_collected ?? 0), 0);

  const totalCustomersPrev = allCustomers.filter((c) => {
    const created = new Date(c.created_at as string);
    return created < curStart;
  }).length;

  const totalDelta = formatDelta(totalCustomers, totalCustomersPrev);
  const newDelta = formatDelta(newCustomersMtd, newCustomersPrev);
  const activeDelta = formatDelta(activeDeals, activeDealsPrev);
  const salesDelta = formatCurrencyDelta(totalSalesMtd, totalSalesPrev);

  return {
    totalCustomers,
    newCustomersMtd,
    activeDeals,
    totalSalesMtd,
    totalCustomersDelta: totalDelta.text,
    totalCustomersDeltaColor: totalDelta.color,
    newCustomersDelta: newDelta.text,
    newCustomersDeltaColor: newDelta.color,
    activeDealsDelta: activeDelta.text,
    activeDealsDeltaColor: activeDelta.color,
    totalSalesDelta: salesDelta.text,
    totalSalesDeltaColor: salesDelta.color,
  };
}
