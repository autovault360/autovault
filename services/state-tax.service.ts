import { createClient } from "@/lib/supabase/server";
import { getDealAggregates } from "./deal-jacket.service";
import { getStateTaxFilingDeadlines } from "@/lib/state-tax/server/get-filing-deadlines";
import type { StateTaxReport, StateTaxKpi, StateTaxTransaction, StateTaxYtdRow, StateTaxBreakdownSegment } from "@/lib/state-tax/types";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function yearToDate(): { from: string; to: string } {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };
}

function currentMonth(): { from: string; to: string } {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    to: now.toISOString().slice(0, 10),
  };
}

export async function getStateTaxReport(dealershipId: string): Promise<StateTaxReport> {
  const { from: mtdFrom, to: mtdTo } = currentMonth();
  const { from: ytdFrom, to: ytdTo } = yearToDate();

  const [thisMonthAgg, ytdAgg, supabase] = await Promise.all([
    getDealAggregates(dealershipId, mtdFrom, mtdTo),
    getDealAggregates(dealershipId, ytdFrom, ytdTo),
    createClient(),
  ]);

  const totalTaxCollected = thisMonthAgg.totalTax;
  const totalTaxableSales = thisMonthAgg.totalSales;
  const ytdTaxCollected = ytdAgg.totalTax;
  const ytdTaxableSales = ytdAgg.totalSales;

  const taxDue = Math.max(0, totalTaxCollected - (totalTaxCollected * 0.6));

  const now = new Date();
  const nextFilingMonth = now.getMonth() + 1;
  const nextFilingYear = nextFilingMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
  const nextFilingMonthStr = nextFilingMonth > 12 ? 1 : nextFilingMonth;
  const nextFilingDate = new Date(nextFilingYear, nextFilingMonthStr, 20);
  const nextFilingFormatted = nextFilingDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const filingDeadlines = getStateTaxFilingDeadlines(ytdFrom, ytdTo);
  const nextDeadline = filingDeadlines.find((d) => d.date >= now.toISOString().slice(0, 10));

  const kpis: StateTaxKpi[] = [
    {
      id: "collected",
      label: "Total State Tax Collected",
      valueFormatted: fmt(totalTaxCollected),
      iconColor: "green",
      trend: {
        value: "+ 0%",
        sentiment: "positive",
        direction: "up",
        comparisonLabel: `vs ${mtdFrom} ... ${mtdTo}`,
      },
    },
    {
      id: "taxable-sales",
      label: "Taxable Vehicle Sales",
      valueFormatted: fmt(totalTaxableSales),
      iconColor: "blue",
      trend: {
        value: "+ 0%",
        sentiment: "positive",
        direction: "up",
        comparisonLabel: `vs ${mtdFrom} ... ${mtdTo}`,
      },
    },
    {
      id: "tax-due",
      label: "State Tax Due (Next)",
      valueFormatted: fmt(taxDue),
      iconColor: "purple",
      subtext: nextDeadline ? `Due: ${nextDeadline.date}` : nextFilingFormatted,
    },
    {
      id: "filing-due",
      label: "Next Filing Due Date",
      valueFormatted: nextDeadline?.date ?? nextFilingFormatted,
      iconColor: "orange",
      subtext: nextDeadline?.title ?? "Monthly",
    },
  ];

  const ytdRows: StateTaxYtdRow[] = [
    {
      id: "collected",
      label: "Total State Tax Collected",
      amountFormatted: fmt(ytdTaxCollected),
    },
    {
      id: "taxable",
      label: "Total Sales (Taxable)",
      amountFormatted: fmt(ytdTaxableSales),
    },
    {
      id: "paid",
      label: "Total Tax Paid / Remitted",
      amountFormatted: fmt(ytdTaxCollected * 0.8),
    },
    {
      id: "due",
      label: "State Tax Due",
      amountFormatted: fmt(ytdTaxCollected * 0.2),
      highlight: "danger",
    },
  ];

  const paidPct = ytdTaxCollected > 0 ? Math.round((ytdTaxCollected * 0.8 / ytdTaxCollected) * 100) : 0;

  const chartBreakdown: StateTaxBreakdownSegment[] = [
    {
      id: "paid",
      label: "Tax Paid",
      color: "#22C55E",
      percent: paidPct,
      amountFormatted: fmt(ytdTaxCollected * 0.8),
    },
    {
      id: "due",
      label: "Tax Due",
      color: "#EF4444",
      percent: 100 - paidPct,
      amountFormatted: fmt(ytdTaxCollected * 0.2),
    },
  ];

  const { data: transactions } = await supabase
    .from("deal_jackets")
    .select(
      `
      id,
      jacket_number,
      sold_price,
      total_tax,
      date_sold,
      vehicle:vehicles(year, make, model)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .not("total_tax", "is", null)
    .order("date_sold", { ascending: false })
    .limit(5);

  const txRows: StateTaxTransaction[] = ((transactions ?? []) as Array<{
    id: string;
    jacket_number: string | null;
    sold_price: number;
    total_tax: number;
    date_sold: string;
    vehicle: { year: number; make: string; model: string }[] | null;
  }>).map((row) => {
    const v = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    return {
      id: row.id,
      date: row.date_sold ? new Date(row.date_sold).toLocaleDateString("en-US") : "",
      invoiceNumber: row.jacket_number ?? `INV-${row.id.slice(0, 5)}`,
      vehicle: v ? `${v.year} ${v.make} ${v.model}` : "Unknown Vehicle",
      taxableAmount: Number(row.sold_price ?? 0),
      taxableAmountFormatted: fmt(row.sold_price ?? 0),
      taxCollected: Number(row.total_tax ?? 0),
      taxCollectedFormatted: fmt(row.total_tax ?? 0),
      status: "collected",
    };
  });

  return {
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "reports", label: "State Tax Reports" },
      { id: "transactions", label: "Transactions" },
      { id: "configuration", label: "Tax Configuration" },
      { id: "reminders", label: "Reminders" },
    ],
    config: {
      state: "California",
      stateSalesTaxPercent: "7.250",
      additionalLocalTaxPercent: "0.500",
      filingFrequency: "Monthly",
      filingDueDates: "Day 20 of the following month",
      additionalLocalTaxApplies: "Yes",
    },
    configOptions: {
      states: ["California", "Texas", "Florida", "Arizona", "Nevada"],
      localTaxOptions: [
        { value: "0.500", label: "0.500%" },
        { value: "1.750", label: "1.750%" },
        { value: "0.000", label: "0.000%" },
        { value: "na", label: "Not Applicable (NA)" },
      ],
      filingFrequencies: ["Monthly", "Quarterly", "Annually"],
      filingDueDateOptions: [
        "Day 20 of the following month",
        "Last day of the following month",
        "Day 15 of the following month",
      ],
      yesNoOptions: ["Yes", "No"],
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
  };
}
