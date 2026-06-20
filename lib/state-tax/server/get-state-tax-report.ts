"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { createClient } from "@/lib/supabase/server";
import {
  getTaxSettings,
  getFilingPeriods,
  getUpcomingPeriod,
  getUpcomingReminders,
} from "@/services/tax-filing.service";
import type {
  StateTaxReport,
  StateTaxKpi,
  StateTaxTransaction,
  StateTaxYtdRow,
  StateTaxBreakdownSegment,
} from "@/lib/state-tax/types";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export async function getStateTaxReport(): Promise<StateTaxReport> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    throw new Error("Unauthorized");
  }

  const dealershipId = auth.user.dealershipId;

  const [settings, periods, upcomingPeriod, reminders, supabase] =
    await Promise.all([
      getTaxSettings(dealershipId),
      getFilingPeriods(dealershipId),
      getUpcomingPeriod(dealershipId),
      getUpcomingReminders(dealershipId),
      createClient(),
    ]);

  // �”€�”€ KPIs �”€�”€
  const totalTaxAll = periods.reduce((s, p) => s + p.totalTaxEntered, 0);
  const totalVehicles = periods.reduce((s, p) => s + p.vehicleCount, 0);
  const activePeriods = periods.filter(
    (p) => p.status === "open" || p.status === "due",
  ).length;

  const kpis: StateTaxKpi[] = [
    {
      id: "total-tax",
      label: "Total Tax Entered",
      valueFormatted: fmt(totalTaxAll),
      iconColor: "green",
      subtext: `Across ${periods.length} filing period${periods.length !== 1 ? "s" : ""}`,
    },
    {
      id: "vehicles",
      label: "Vehicles in Filing",
      valueFormatted: String(totalVehicles),
      iconColor: "blue",
      subtext: "Linked to filing periods",
    },
    {
      id: "next-filing",
      label: "Next Filing Due",
      valueFormatted: upcomingPeriod ? upcomingPeriod.name : "N/A",
      iconColor: "purple",
      subtext: upcomingPeriod
        ? `Due: ${new Date(upcomingPeriod.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : "No upcoming filing",
    },
    {
      id: "active-periods",
      label: "Active Periods",
      valueFormatted: String(activePeriods),
      iconColor: "orange",
      subtext: "Requiring attention",
    },
  ];

  // �”€�”€ YTD Summary + Donut Chart �”€�”€
  const currentYear = new Date().getFullYear();
  const ytdPeriods = periods.filter((p) => {
    const year = new Date(p.startDate).getFullYear();
    return year === currentYear;
  });

  const ytdTax = ytdPeriods.reduce((s, p) => s + p.totalTaxEntered, 0);
  const ytdVehicles = ytdPeriods.reduce((s, p) => s + p.vehicleCount, 0);
  const paidYtdTax = periods
    .filter((p) => p.status === "paid" || p.status === "filed" || p.status === "closed")
    .reduce((s, p) => s + p.totalTaxEntered, 0);
  const dueYtdTax = Math.max(0, ytdTax - paidYtdTax);

  const paidPct = ytdTax > 0 ? Math.round((paidYtdTax / ytdTax) * 100) : 0;

  const ytdRows: StateTaxYtdRow[] = [
    {
      id: "collected",
      label: "Total Tax Entered (YTD)",
      amountFormatted: fmt(ytdTax),
    },
    {
      id: "vehicles",
      label: "Vehicles (YTD)",
      amountFormatted: String(ytdVehicles),
    },
    {
      id: "paid",
      label: "Tax Paid / Filed",
      amountFormatted: fmt(paidYtdTax),
    },
    {
      id: "due",
      label: "Tax Due",
      amountFormatted: fmt(dueYtdTax),
      highlight: "danger",
    },
  ];

  const chartBreakdown: StateTaxBreakdownSegment[] = [
    {
      id: "paid",
      label: "Tax Paid / Filed",
      color: "#22C55E",
      percent: paidPct,
      amountFormatted: fmt(paidYtdTax),
    },
    {
      id: "due",
      label: "Tax Due",
      color: "#EF4444",
      percent: 100 - paidPct,
      amountFormatted: fmt(dueYtdTax),
    },
  ];

  // �”€�”€ Monthly Tax Data for Bar Chart �”€�”€
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyTaxData: { name: string; tax: number; vehicles: number }[] =
    months.map((name, i) => {
      const monthPeriods = periods.filter((p) => {
        const d = new Date(p.startDate);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      });
      const tax = monthPeriods.reduce((s, p) => s + p.totalTaxEntered, 0);
      const vehicles = monthPeriods.reduce((s, p) => s + p.vehicleCount, 0);
      return { name, tax, vehicles };
    });

  // �”€�”€ Recent Transactions �”€�”€
  const { data: transactions } = await supabase
    .from("deal_jackets")
    .select(
      `id, jacket_number, sold_price, total_tax, date_sold, vehicle:vehicles(year, make, model)`,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .not("total_tax", "is", null)
    .order("date_sold", { ascending: false })
    .limit(5);

  const txRows: StateTaxTransaction[] = (
    (transactions ?? []) as Array<{
      id: string;
      jacket_number: string | null;
      sold_price: number;
      total_tax: number;
      date_sold: string;
      vehicle: { year: number; make: string; model: string }[] | null;
    }>
  ).map((row) => {
    const v = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    return {
      id: row.id,
      date: row.date_sold
        ? new Date(row.date_sold).toLocaleDateString("en-US")
        : "",
      invoiceNumber:
        row.jacket_number ?? `INV-${row.id.slice(0, 5)}`,
      vehicle: v ? `${v.year} ${v.make} ${v.model}` : "Unknown Vehicle",
      taxableAmount: Number(row.sold_price ?? 0),
      taxableAmountFormatted: fmt(row.sold_price ?? 0),
      taxCollected: Number(row.total_tax ?? 0),
      taxCollectedFormatted: fmt(row.total_tax ?? 0),
      status: "collected",
    };
  });

  // �”€�”€ Config �”€�”€
  const configState = settings?.state ?? "�€”";
  const configFrequency = settings?.filingFrequency ?? "�€”";
  const configReminderDays = settings?.reminderDays ?? 14;

  return {
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "reports", label: "State Tax Reports" },
      { id: "transactions", label: "Transactions" },
      { id: "configuration", label: "Tax Configuration" },
      { id: "reminders", label: "Reminders" },
    ],
    config: {
      state: configState,
      stateSalesTaxPercent: "�€”",
      additionalLocalTaxPercent: "�€”",
      filingFrequency: configFrequency.charAt(0).toUpperCase() + configFrequency.slice(1),
      filingDueDates: `Day ${new Date(0, 0, 0, 0, 0, 0, configReminderDays).getDate() || 20} of the following month`,
      additionalLocalTaxApplies: "�€”",
    },
    configOptions: {
      states: [],
      localTaxOptions: [],
      filingFrequencies: ["Monthly", "Quarterly", "Annually"],
      filingDueDateOptions: [],
      yesNoOptions: [],
    },
    kpis,
    ytdSummary: {
      rows: ytdRows,
      chart: {
        centerPercent: paidPct,
        centerLabel: "Paid",
        breakdown: chartBreakdown,
      },
    },
    transactions: txRows,
    monthlyTaxData,
    reminders: reminders.map((r) => ({
      periodId: r.periodId,
      periodName: r.periodName,
      dueDate: r.dueDate,
      daysUntilDue: r.daysUntilDue,
      vehicleCount: r.vehicleCount,
      status: r.status,
    })),
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
  };
}
