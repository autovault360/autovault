import { formatCurrency } from "@/lib/expenses/types";
import type { StateTaxReport } from "./types";

const fmt = formatCurrency;

export const STATE_TAX_MOCK_REPORT: StateTaxReport = {
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "reports", label: "State Tax Reports" },
    { id: "transactions", label: "Transactions" },
    { id: "configuration", label: "Tax Configuration" },
    { id: "reminders", label: "Reminders" },
  ],
  config: {
    state: "Texas",
    stateSalesTaxPercent: "6.250",
    additionalLocalTaxPercent: "1.750",
    filingFrequency: "Monthly",
    filingDueDates: "Day 20 of the following month",
    additionalLocalTaxApplies: "Yes",
  },
  configOptions: {
    states: ["Texas", "California", "Florida", "Arizona", "Nevada"],
    localTaxOptions: [
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
  kpis: [
    {
      id: "collected",
      label: "Total State Tax Collected",
      valueFormatted: fmt(8245.67),
      iconColor: "green",
      trend: {
        value: "+ 8.4%",
        sentiment: "positive",
        direction: "up",
        comparisonLabel: "vs May 1 – May 31",
      },
    },
    {
      id: "taxable-sales",
      label: "Taxable Vehicle Sales",
      valueFormatted: fmt(162350),
      iconColor: "blue",
      trend: {
        value: "+ 6.7%",
        sentiment: "positive",
        direction: "up",
        comparisonLabel: "vs May 1 – May 31",
      },
    },
    {
      id: "tax-due",
      label: "State Tax Due (Next)",
      valueFormatted: fmt(1374.28),
      iconColor: "purple",
      subtext: "Due: Jun 20, 2025",
    },
    {
      id: "filing-due",
      label: "Next Filing Due Date",
      valueFormatted: "Jun 20, 2025",
      iconColor: "orange",
      subtext: "Monthly",
    },
  ],
  ytdSummary: {
    rows: [
      {
        id: "collected",
        label: "Total State Tax Collected",
        amountFormatted: fmt(8245.67),
      },
      {
        id: "taxable",
        label: "Total Sales (Taxable)",
        amountFormatted: fmt(162350),
      },
      {
        id: "non-taxable",
        label: "Total Sales (Non-Taxable)",
        amountFormatted: fmt(21450),
      },
      {
        id: "paid",
        label: "Total Tax Paid / Remitted",
        amountFormatted: fmt(6871.39),
      },
      {
        id: "due",
        label: "State Tax Due",
        amountFormatted: fmt(1374.28),
        highlight: "danger",
      },
    ],
    chart: {
      centerPercent: 83.3,
      centerLabel: "Paid",
      breakdown: [
        {
          id: "paid",
          label: "Tax Paid",
          color: "#22C55E",
          percent: 83.3,
          amountFormatted: fmt(6871.39),
        },
        {
          id: "due",
          label: "Tax Due",
          color: "#EF4444",
          percent: 16.7,
          amountFormatted: fmt(1374.28),
        },
      ],
    },
  },
  transactions: [
    {
      id: "tx-1",
      date: "05/20/2025",
      invoiceNumber: "INV-10285",
      vehicle: "2020 Toyota Camry",
      taxableAmount: 18900,
      taxableAmountFormatted: fmt(18900),
      taxCollected: 1181.25,
      taxCollectedFormatted: fmt(1181.25),
      status: "collected",
    },
    {
      id: "tx-2",
      date: "05/19/2025",
      invoiceNumber: "INV-10284",
      vehicle: "2019 Honda Accord",
      taxableAmount: 17500,
      taxableAmountFormatted: fmt(17500),
      taxCollected: 1093.75,
      taxCollectedFormatted: fmt(1093.75),
      status: "collected",
    },
    {
      id: "tx-3",
      date: "05/18/2025",
      invoiceNumber: "INV-10283",
      vehicle: "2021 Ford F-150",
      taxableAmount: 24200,
      taxableAmountFormatted: fmt(24200),
      taxCollected: 1512.5,
      taxCollectedFormatted: fmt(1512.5),
      status: "collected",
    },
    {
      id: "tx-4",
      date: "05/17/2025",
      invoiceNumber: "INV-10282",
      vehicle: "2018 Chevrolet Silverado",
      taxableAmount: 22750,
      taxableAmountFormatted: fmt(22750),
      taxCollected: 1421.88,
      taxCollectedFormatted: fmt(1421.88),
      status: "collected",
    },
    {
      id: "tx-5",
      date: "05/16/2025",
      invoiceNumber: "INV-10281",
      vehicle: "2017 Nissan Altima",
      taxableAmount: 15800,
      taxableAmountFormatted: fmt(15800),
      taxCollected: 987.5,
      taxCollectedFormatted: fmt(987.5),
      status: "collected",
    },
  ],
};
