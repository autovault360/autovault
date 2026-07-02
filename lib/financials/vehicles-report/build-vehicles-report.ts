import {
  CATEGORY_META,
  CATEGORY_ORDER,
  normalizeHtmlCategory,
  type HtmlVehicleCategory,
} from "@/lib/financials/vehicles-report/category-meta";
import {
  daysBetweenDates,
  formatAvMoney,
  formatAvPercent,
  formatAvSignedMoney,
  formatAvTableDate,
} from "@/lib/financials/vehicles-report/format";
import type {
  VehiclesByLossReportData,
  VehiclesByProfitReportData,
  VehiclesReportCategoryCard,
  VehiclesReportVehicleRow,
} from "@/lib/financials/vehicles-report/types";
import type { StatKpiData } from "@/components/ui/kpi-card";
import { fetchJacketsInRangeExtended } from "@/lib/cpa/server/finance/fetch-period-data";
import { resolveCpaPeriodBounds } from "@/lib/cpa/server/finance/period-utils";
import type { CpaViewMode } from "@/lib/cpa/types";

function getVehicle<T extends { vehicle: unknown }>(row: T) {
  return Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
}

function getSalesRep<T extends { sales_rep: unknown }>(row: T) {
  const rep = Array.isArray(row.sales_rep) ? row.sales_rep[0] : row.sales_rep;
  return (rep as { full_name?: string } | null)?.full_name ?? "Unassigned";
}

function getCustomer<T extends { customer: unknown }>(row: T) {
  const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
  return (customer as { name?: string } | null)?.name ?? null;
}

function mapVehicleRow(
  row: Awaited<ReturnType<typeof fetchJacketsInRangeExtended>>[number],
): VehiclesReportVehicleRow {
  const vehicle = getVehicle(row);
  const year = vehicle?.year ?? 0;
  const make = vehicle?.make ?? "";
  const model = vehicle?.model ?? "";
  const purchasePrice = Number(vehicle?.acquisition_cost ?? 0);
  const soldPrice = Number(row.sold_price);
  const totalVehicleCost = Number(row.total_invested);
  const grossProfit = Number(row.profit_gross);
  const netProfit = Number(row.profit_net);
  const roi =
    totalVehicleCost > 0
      ? Math.round((netProfit / totalVehicleCost) * 1000) / 10
      : 0;
  const dateSold = row.date_sold.split("T")[0] ?? row.date_sold;
  const acquisitionDate =
    (vehicle as { acquisition_date?: string | null } | null)?.acquisition_date ??
    dateSold;

  return {
    id: row.id,
    vin: vehicle?.vin ?? "",
    soldDate: formatAvTableDate(dateSold),
    year,
    make,
    model,
    category: normalizeHtmlCategory(
      (vehicle as { body_style?: string | null } | null)?.body_style,
      model,
      make,
    ),
    purchasePrice,
    soldPrice,
    grossProfit,
    netProfit,
    roi,
    salesRep: getSalesRep(row),
    daysOnLot: daysBetweenDates(acquisitionDate, dateSold),
    customerName: getCustomer(row),
    totalVehicleCost,
    commission: Number(row.commission_amount),
    repairs: Math.max(0, totalVehicleCost - purchasePrice),
    flooringCost: 0,
    fees: 0,
    addOns: 0,
    salesTax: Number(row.total_tax ?? 0),
    regFees: 0,
    sold: true,
  };
}

function buildCategoryCards(
  vehicles: VehiclesReportVehicleRow[],
  mode: "profit" | "loss",
): VehiclesReportCategoryCard[] {
  return CATEGORY_ORDER.map((category) => {
    const meta = CATEGORY_META[category];
    const inCategory = vehicles.filter((vehicle) => vehicle.category === category);

    if (inCategory.length === 0) {
      return {
        id: category,
        categoryName: category,
        accentColor: meta.accent,
        empty: true,
        rows:
          mode === "profit"
            ? [
                { label: "Vehicles Sold", value: "0" },
                { label: "Total Net Profit", value: "—" },
                { label: "Avg ROI %", value: "—" },
              ]
            : [
                { label: "Vehicles", value: "0" },
                { label: "Total Loss", value: "—" },
                { label: "Avg ROI %", value: "—" },
              ],
      };
    }

    const totalAmount = inCategory.reduce((sum, row) => sum + row.netProfit, 0);
    const avgRoi =
      inCategory.reduce((sum, row) => sum + row.roi, 0) / inCategory.length;

    return {
      id: category,
      categoryName: category,
      accentColor: meta.accent,
      rows:
        mode === "profit"
          ? [
              { label: "Vehicles Sold", value: String(inCategory.length) },
              {
                label: "Total Net Profit",
                value: formatAvMoney(totalAmount),
                emphasis: "profit" as const,
              },
              { label: "Avg ROI %", value: formatAvPercent(avgRoi) },
            ]
          : [
              { label: "Vehicles", value: String(inCategory.length) },
              {
                label: "Total Loss",
                value: formatAvSignedMoney(totalAmount),
                emphasis: "loss" as const,
              },
              { label: "Avg ROI %", value: formatAvPercent(avgRoi) },
            ],
    };
  });
}

function periodLabel(view: CpaViewMode, month: number, year: number) {
  return view === "yearly"
    ? `${year}`
    : new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
}

export async function buildVehiclesByProfitReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<VehiclesByProfitReportData> {
  const bounds = resolveCpaPeriodBounds(params.view, params.month, params.year);
  const jackets = await fetchJacketsInRangeExtended(
    dealershipId,
    bounds.start,
    bounds.end,
  );

  const vehicles = jackets
    .filter((row) => Number(row.profit_net) > 0)
    .map(mapVehicleRow)
    .sort((a, b) => b.netProfit - a.netProfit);

  const totalVehicles = vehicles.length;
  const totalNetProfit = vehicles.reduce((sum, row) => sum + row.netProfit, 0);
  const avgGross =
    totalVehicles > 0
      ? vehicles.reduce((sum, row) => sum + row.grossProfit, 0) / totalVehicles
      : 0;
  const avgRoi =
    totalVehicles > 0
      ? vehicles.reduce((sum, row) => sum + row.roi, 0) / totalVehicles
      : 0;

  const summaryKpis: StatKpiData[] = [
    {
      accent: "green",
      icon: "?",
      label: "Total Profitable Vehicles",
      value: String(totalVehicles),
      foot: "sold & profitable",
    },
    {
      accent: "blue",
      icon: "$",
      label: "Total Net Profit",
      value: formatAvMoney(totalNetProfit),
      foot: "combined, after all costs",
    },
    {
      accent: "orange",
      icon: "?",
      label: "Average Gross Profit",
      value: formatAvMoney(avgGross),
      foot: "sold price ? purchase price",
    },
    {
      accent: "purple",
      icon: "%",
      label: "Average ROI %",
      value: formatAvPercent(avgRoi),
      foot: "return on total cost",
    },
  ];

  return {
    periodLabel: periodLabel(params.view, params.month, params.year),
    summaryKpis,
    categoryCards: buildCategoryCards(vehicles, "profit"),
    vehicles,
    rowCountSubtitle: `${totalVehicles} profitable sale${totalVehicles === 1 ? "" : "s"}, sorted by net profit`,
  };
}

export async function buildVehiclesByLossReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<VehiclesByLossReportData> {
  const bounds = resolveCpaPeriodBounds(params.view, params.month, params.year);
  const jackets = await fetchJacketsInRangeExtended(
    dealershipId,
    bounds.start,
    bounds.end,
  );

  const vehicles = jackets
    .filter((row) => Number(row.profit_net) < 0)
    .map(mapVehicleRow)
    .sort((a, b) => a.netProfit - b.netProfit);

  const total = vehicles.length;
  const totalLoss = vehicles.reduce((sum, row) => sum + row.netProfit, 0);
  const avgLoss = total > 0 ? totalLoss / total : 0;
  const avgRoi =
    total > 0 ? vehicles.reduce((sum, row) => sum + row.roi, 0) / total : 0;

  const summaryKpis: StatKpiData[] = [
    {
      accent: "red",
      icon: "!",
      label: "Vehicles at a Loss",
      value: String(total),
      foot: "underwater units",
    },
    {
      accent: "red",
      icon: "$",
      label: "Total Net Loss",
      value: formatAvSignedMoney(totalLoss),
      foot: "combined, after all costs",
    },
    {
      accent: "orange",
      icon: "?",
      label: "Average Loss",
      value: formatAvSignedMoney(avgLoss),
      foot: "per vehicle",
    },
    {
      accent: "purple",
      icon: "%",
      label: "Average ROI %",
      value: formatAvPercent(avgRoi),
      foot: "return on total cost",
    },
  ];

  return {
    periodLabel: periodLabel(params.view, params.month, params.year),
    summaryKpis,
    categoryCards: buildCategoryCards(vehicles, "loss"),
    vehicles,
    rowCountSubtitle: total
      ? `${total} vehicle${total === 1 ? "" : "s"} at a loss, biggest first`
      : "No vehicles at a loss",
  };
}
