"use server";

import { createClient } from "@/lib/supabase/server";
import type { CpaViewMode } from "@/lib/cpa/types";
import type {
  CpaSalesTaxKpi,
  CpaSalesTaxPageData,
  CpaSalesTaxVehicleRow,
} from "@/lib/cpa/sales-tax/types";
import {
  aggregateCpaPeriod,
  fetchJacketsInRangeExtended,
  sumTaxPayments,
} from "../finance/fetch-period-data";
import { resolveCpaPeriodBounds } from "../finance/period-utils";

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type FilingPeriodInfo = {
  status: string;
  updatedAt: string;
  endDate: string;
};

type UnsoldVehicleRow = {
  id: string;
  stock_number: string | null;
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
  purchase_type: string | null;
};

function formatMoney(n: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(n);
}

function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

function formatPeriodLabel(view: CpaViewMode, month: number, year: number): string {
  if (view === "yearly") return String(year);
  return `${MONTH_NAMES_FULL[month - 1] ?? "January"} ${year}`;
}

function formatComparisonLabel(view: CpaViewMode, month: number, year: number): string {
  if (view === "yearly") return String(year - 1);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${MONTH_NAMES_FULL[prevMonth - 1] ?? "January"} ${prevYear}`;
}

function formatPeriodEndLabel(view: CpaViewMode, month: number, year: number): string {
  if (view === "yearly") {
    return `As of December 31, ${year}`;
  }
  const lastDay = new Date(year, month, 0).getDate();
  const monthName = MONTH_NAMES_FULL[month - 1] ?? "January";
  return `As of ${monthName} ${lastDay}, ${year}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatTrendDelta(
  current: number,
  previous: number,
  comparisonLabel: string,
): string {
  const change = pctChange(current, previous);
  const arrow = change >= 0 ? "?" : "?";
  return `${arrow} ${Math.abs(change).toFixed(1)}% vs ${comparisonLabel}`;
}

function formatRateDelta(current: number, previous: number, comparisonLabel: string): string {
  const diff = current - previous;
  const arrow = diff >= 0 ? "?" : "?";
  return `${arrow} ${Math.abs(diff).toFixed(2)}% vs ${comparisonLabel}`;
}

function formatDisplayDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "2-digit", day: "2-digit", year: "numeric" },
  );
}

function isFilingSettled(status: string): boolean {
  return status === "paid" || status === "filed" || status === "closed";
}

async function fetchFilingPeriodByJacket(
  dealershipId: string,
  jacketIds: string[],
): Promise<Map<string, FilingPeriodInfo>> {
  const map = new Map<string, FilingPeriodInfo>();
  if (jacketIds.length === 0) return map;

  const supabase = await createClient();
  const { data: links } = await supabase
    .from("filing_period_deals")
    .select("deal_jacket_id, filing_period_id")
    .in("deal_jacket_id", jacketIds);

  if (!links?.length) return map;

  const periodIds = [...new Set(links.map((link) => link.filing_period_id as string))];
  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("id, status, updated_at, end_date")
    .eq("dealership_id", dealershipId)
    .in("id", periodIds);

  const periodById = new Map(
    (periods ?? []).map((period) => [
      period.id as string,
      {
        status: period.status as string,
        updatedAt: period.updated_at as string,
        endDate: period.end_date as string,
      },
    ]),
  );

  for (const link of links) {
    const period = periodById.get(link.filing_period_id as string);
    if (period) {
      map.set(link.deal_jacket_id as string, period);
    }
  }

  return map;
}

async function fetchUnsoldVehicles(dealershipId: string): Promise<UnsoldVehicleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, stock_number, vin, year, make, model, purchase_type")
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .eq("status", "in_stock")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("fetchUnsoldVehicles:", error.message);
    return [];
  }

  return (data ?? []) as UnsoldVehicleRow[];
}

function getLatestTaxPaymentDate(
  expenses: Awaited<
    ReturnType<typeof aggregateCpaPeriod>
  >["dealershipExpenses"],
): string | null {
  const taxExpenses = expenses
    .filter((expense) => {
      const text = `${expense.description} ${expense.vendor} ${expense.category}`.toLowerCase();
      return (
        text.includes("tax") ||
        text.includes("cdtfa") ||
        text.includes("sales tax")
      );
    })
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date));

  return taxExpenses[0]?.expense_date ?? null;
}

function buildComplianceKpi(
  balanceDue: number,
  openFilings: number,
): Pick<CpaSalesTaxKpi, "value" | "delta" | "deltaColor"> {
  if (balanceDue <= 0 && openFilings === 0) {
    return {
      value: "Compliant",
      delta: "All returns up to date",
      deltaColor: "teal",
    };
  }

  if (openFilings > 0 && balanceDue > 0) {
    return {
      value: "Action Required",
      delta: `${openFilings} open filing${openFilings === 1 ? "" : "s"}`,
      deltaColor: "red",
    };
  }

  return {
    value: "Pending",
    delta: "Remittance due",
    deltaColor: "orange",
  };
}

function buildSoldVehicleRows(
  jackets: Awaited<ReturnType<typeof fetchJacketsInRangeExtended>>,
  filingMap: Map<string, FilingPeriodInfo>,
  remittedRatio: number,
  remittedDate: string | null,
): CpaSalesTaxVehicleRow[] {
  return jackets.map((row) => {
    const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
    const salePrice = Number(row.sold_price);
    const taxCollected = Number(row.total_tax);
    const taxRate = salePrice > 0 ? (taxCollected / salePrice) * 100 : 0;
    const filing = filingMap.get(row.id);
    const settled = filing ? isFilingSettled(filing.status) : false;
    const salesTaxRemitted = settled
      ? taxCollected
      : Math.round(taxCollected * remittedRatio * 100) / 100;
    const adjustments = 0;
    const taxPayable = Math.max(
      0,
      Math.round((taxCollected - salesTaxRemitted - adjustments) * 100) / 100,
    );
    const status = taxPayable <= 0.01 ? "Paid" : "Pending";

    return {
      id: row.id,
      stockNumber: vehicle?.stock_number ?? "-",
      vin: vehicle?.vin ?? "-",
      yearMakeModel:
        `${vehicle?.year ?? ""} ${vehicle?.make ?? ""} ${vehicle?.model ?? ""}`.trim() ||
        "Unknown Vehicle",
      dateSold: formatDisplayDate(row.date_sold),
      salePrice,
      taxRate,
      salesTaxCollected: taxCollected,
      salesTaxRemitted,
      adjustments,
      taxPayable,
      status,
      remittedDate: status === "Paid" ? remittedDate : null,
      make: vehicle?.make ?? "Unknown",
      vehicleType: vehicle?.purchase_type ?? "Other",
      isSold: true,
    };
  });
}

function buildUnsoldVehicleRows(vehicles: UnsoldVehicleRow[]): CpaSalesTaxVehicleRow[] {
  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    stockNumber: vehicle.stock_number ?? "-",
    vin: vehicle.vin ?? "-",
    yearMakeModel:
      `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() ||
      "Unknown Vehicle",
    dateSold: null,
    salePrice: 0,
    taxRate: 0,
    salesTaxCollected: 0,
    salesTaxRemitted: 0,
    adjustments: 0,
    taxPayable: 0,
    status: "Unsold",
    remittedDate: null,
    make: vehicle.make ?? "Unknown",
    vehicleType: vehicle.purchase_type ?? "Other",
    isSold: false,
  }));
}

function buildTotals(vehicles: CpaSalesTaxVehicleRow[]) {
  const soldVehicles = vehicles.filter((vehicle) => vehicle.isSold);
  return {
    vehicleCount: soldVehicles.length,
    salePrice: soldVehicles.reduce((sum, vehicle) => sum + vehicle.salePrice, 0),
    salesTaxCollected: soldVehicles.reduce(
      (sum, vehicle) => sum + vehicle.salesTaxCollected,
      0,
    ),
    salesTaxRemitted: soldVehicles.reduce(
      (sum, vehicle) => sum + vehicle.salesTaxRemitted,
      0,
    ),
    adjustments: soldVehicles.reduce((sum, vehicle) => sum + vehicle.adjustments, 0),
    taxPayable: soldVehicles.reduce((sum, vehicle) => sum + vehicle.taxPayable, 0),
  };
}

function buildKpis(params: {
  taxCollected: number;
  taxCollectedPrev: number;
  taxRemitted: number;
  taxRemittedPrev: number;
  taxPayable: number;
  effectiveRate: number;
  effectiveRatePrev: number;
  comparisonLabel: string;
  periodEndLabel: string;
  openFilings: number;
}): CpaSalesTaxKpi[] {
  const compliance = buildComplianceKpi(params.taxPayable, params.openFilings);

  return [
    {
      id: "tax-collected",
      label: "Total Sales Tax Collected",
      value: formatMoney(params.taxCollected),
      delta: formatTrendDelta(
        params.taxCollected,
        params.taxCollectedPrev,
        params.comparisonLabel,
      ),
      deltaColor: "green",
      icon: "dollar-sign",
      color: "green",
    },
    {
      id: "tax-remitted",
      label: "Total Sales Tax Remitted",
      value: formatMoney(params.taxRemitted),
      delta: formatTrendDelta(
        params.taxRemitted,
        params.taxRemittedPrev,
        params.comparisonLabel,
      ),
      deltaColor: "blue",
      icon: "landmark",
      color: "blue",
    },
    {
      id: "tax-payable",
      label: "Sales Tax Payable",
      value: formatMoney(params.taxPayable),
      delta: params.periodEndLabel,
      deltaColor: "neutral",
      icon: "wallet",
      color: "violet",
    },
    {
      id: "effective-rate",
      label: "Effective Tax Rate",
      value: formatPercent(params.effectiveRate),
      delta: formatRateDelta(
        params.effectiveRate,
        params.effectiveRatePrev,
        params.comparisonLabel,
      ),
      deltaColor: "orange",
      icon: "percent",
      color: "orange",
    },
    {
      id: "compliance",
      label: "Compliance Status",
      value: compliance.value,
      delta: compliance.delta,
      deltaColor: compliance.deltaColor,
      icon: "badge-check",
      color: "teal",
    },
  ];
}

async function buildPreviousSoldRows(
  dealershipId: string,
  prevStart: string,
  prevEnd: string,
  previous: Awaited<ReturnType<typeof aggregateCpaPeriod>>,
  taxPaymentsMadePrev: number,
): Promise<CpaSalesTaxVehicleRow[]> {
  const prevJackets = await fetchJacketsInRangeExtended(
    dealershipId,
    prevStart,
    prevEnd,
  );
  const prevFilingMap = await fetchFilingPeriodByJacket(
    dealershipId,
    prevJackets.map((jacket) => jacket.id),
  );
  const prevRemittedRatio =
    previous.totals.sales_tax_collected > 0
      ? Math.min(1, taxPaymentsMadePrev / previous.totals.sales_tax_collected)
      : 0;

  return buildSoldVehicleRows(
    prevJackets,
    prevFilingMap,
    prevRemittedRatio,
    formatDisplayDate(getLatestTaxPaymentDate(previous.dealershipExpenses)),
  );
}

export async function fetchCpaSalesTax(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaSalesTaxPageData> {
  const { view, month, year } = params;
  const bounds = resolveCpaPeriodBounds(view, month, year);
  const periodLabel = formatPeriodLabel(view, month, year);
  const comparisonLabel = formatComparisonLabel(view, month, year);
  const periodEndLabel = formatPeriodEndLabel(view, month, year);

  const [current, previous, jackets, unsoldVehicles, supabase] = await Promise.all([
    aggregateCpaPeriod(dealershipId, bounds.start, bounds.end),
    aggregateCpaPeriod(dealershipId, bounds.prevStart, bounds.prevEnd),
    fetchJacketsInRangeExtended(dealershipId, bounds.start, bounds.end),
    fetchUnsoldVehicles(dealershipId),
    createClient(),
  ]);

  const taxCollected = current.totals.sales_tax_collected;
  const taxCollectedPrev = previous.totals.sales_tax_collected;
  const taxableSales = current.totals.vehicle_sales;
  const taxableSalesPrev = previous.totals.vehicle_sales;
  const taxPaymentsMade = sumTaxPayments(current.dealershipExpenses);
  const taxPaymentsMadePrev = sumTaxPayments(previous.dealershipExpenses);
  const remittedRatio =
    taxCollected > 0 ? Math.min(1, taxPaymentsMade / taxCollected) : 0;
  const remittedDate = formatDisplayDate(getLatestTaxPaymentDate(current.dealershipExpenses));

  const filingMap = await fetchFilingPeriodByJacket(
    dealershipId,
    jackets.map((jacket) => jacket.id),
  );

  const { count: openFilingsCount } = await supabase
    .from("tax_filing_periods")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .gte("start_date", bounds.start)
    .lte("end_date", bounds.end)
    .in("status", ["open", "due"]);

  const soldRows = buildSoldVehicleRows(jackets, filingMap, remittedRatio, remittedDate);
  const unsoldRows = buildUnsoldVehicleRows(unsoldVehicles);
  const vehicles = [...soldRows, ...unsoldRows];
  const totals = buildTotals(soldRows);

  const effectiveRate =
    taxableSales > 0 ? Math.round((taxCollected / taxableSales) * 10000) / 100 : 0;
  const effectiveRatePrev =
    taxableSalesPrev > 0
      ? Math.round((taxCollectedPrev / taxableSalesPrev) * 10000) / 100
      : 0;

  const prevSoldRows = await buildPreviousSoldRows(
    dealershipId,
    bounds.prevStart,
    bounds.prevEnd,
    previous,
    taxPaymentsMadePrev,
  );
  const taxRemittedPrev = buildTotals(prevSoldRows).salesTaxRemitted;

  const makeOptions = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.make).filter(Boolean)),
  ).sort();
  const typeOptions = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.vehicleType).filter(Boolean)),
  ).sort();

  const dataAsOf = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    periodLabel,
    comparisonLabel,
    periodEndLabel,
    dataAsOf,
    view,
    kpis: buildKpis({
      taxCollected,
      taxCollectedPrev,
      taxRemitted: totals.salesTaxRemitted,
      taxRemittedPrev,
      taxPayable: totals.taxPayable,
      effectiveRate,
      effectiveRatePrev,
      comparisonLabel,
      periodEndLabel,
      openFilings: openFilingsCount ?? 0,
    }),
    vehicles,
    makeOptions,
    typeOptions,
    totals,
  };
}
