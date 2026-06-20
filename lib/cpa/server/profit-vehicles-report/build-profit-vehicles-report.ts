import {
  aggregateCpaPeriod,
  type JacketRow,
} from "@/lib/cpa/server/finance/fetch-period-data";
import { resolveCpaPeriodBounds } from "@/lib/cpa/server/finance/period-utils";
import type { CpaViewMode } from "@/lib/cpa/types";
import type {
  CpaProfitBreakdownSegment,
  CpaProfitByTypeItem,
  CpaProfitSourceItem,
  CpaProfitVehicleRow,
  CpaProfitVehiclesKpi,
  CpaProfitVehiclesReportData,
} from "@/lib/cpa/profit-vehicles-report/types";
import {
  daysBetween,
  formatReportMoney,
  formatReportPercent,
  formatSoldDate,
  normalizeVehicleType,
  resolveProfitMargin,
} from "@/lib/cpa/profit-vehicles-report/utils";

function getVehicle(row: JacketRow) {
  return Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
}

function mapProfitableVehicleRow(row: JacketRow): CpaProfitVehicleRow {
  const vehicle = getVehicle(row);
  const year = vehicle?.year ?? 0;
  const make = vehicle?.make ?? "";
  const model = vehicle?.model ?? "";
  const trim = vehicle?.trim ?? "";
  const salePrice = Number(row.sold_price);
  const grossProfit = Number(row.profit_gross);
  const grossProfitPct =
    salePrice > 0 ? Math.round((grossProfit / salePrice) * 10000) / 100 : 0;
  const dateSold = row.date_sold.split("T")[0] ?? row.date_sold;
  const daysHeld = daysBetween(vehicle?.acquisition_date, row.date_sold);

  return {
    id: row.id,
    stockNumber: vehicle?.stock_number ?? "",
    yearMakeModel: `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`.trim(),
    vin: vehicle?.vin ?? "",
    dateSold: formatSoldDate(dateSold),
    salePrice,
    totalCost: Number(row.total_invested),
    grossProfit,
    grossProfitPct,
    profitMargin: resolveProfitMargin(grossProfitPct),
    profitPerDay: Math.round((grossProfit / daysHeld) * 100) / 100,
    vehicleType: normalizeVehicleType(vehicle?.body_style, model),
    make,
  };
}

function buildKpis(
  vehicles: CpaProfitVehicleRow[],
  totalGrossProfit: number,
  totalProfit: number,
  totalRevenue: number,
): CpaProfitVehiclesKpi[] {
  const count = vehicles.length;
  const avgGross =
    count > 0 ? Math.round(totalGrossProfit / count) : 0;
  const highest = [...vehicles].sort((a, b) => b.grossProfit - a.grossProfit)[0];
  const margin =
    totalRevenue > 0
      ? Math.round((totalGrossProfit / totalRevenue) * 10000) / 100
      : 0;

  return [
    {
      id: "total-profit",
      label: "Total Profit",
      value: formatReportMoney(totalProfit),
      subtext: `${count} Vehicles`,
      icon: "dollar-sign",
      color: "green",
    },
    {
      id: "total-gross-profit",
      label: "Total Gross Profit",
      value: formatReportMoney(totalGrossProfit),
      subtext: `${count} Vehicles`,
      icon: "tag",
      color: "blue",
    },
    {
      id: "avg-gross-profit",
      label: "Average Gross Profit",
      value: formatReportMoney(avgGross),
      subtext: "Per Vehicle",
      icon: "refresh-cw",
      color: "green",
    },
    {
      id: "highest-profit",
      label: "Highest Profit",
      value: highest ? formatReportMoney(highest.grossProfit) : formatReportMoney(0),
      subtext: highest?.yearMakeModel ?? "N/A",
      icon: "bar-chart-3",
      color: "green",
    },
    {
      id: "gross-profit-margin",
      label: "Gross Profit Margin",
      value: formatReportPercent(margin),
      subtext: "vs Revenue",
      icon: "percent",
      color: "blue",
    },
  ];
}

function buildProfitBreakdown(
  totalGrossProfit: number,
  reconditioningProfit: number,
  otherIncome: number,
  totalProfit: number,
): {
  segments: CpaProfitBreakdownSegment[];
  total: number;
} {
  const base = totalGrossProfit > 0 ? totalGrossProfit : 1;
  const segments: CpaProfitBreakdownSegment[] = [
    {
      id: "gross-profit",
      label: "Total Gross Profit",
      amount: totalGrossProfit,
      percent: 100,
      color: "#22c55e",
    },
    {
      id: "reconditioning",
      label: "Total Reconditioning Profit",
      amount: reconditioningProfit,
      percent: Math.round((reconditioningProfit / base) * 1000) / 10,
      color: "#3b82f6",
    },
    {
      id: "other-income",
      label: "Total Other Income",
      amount: otherIncome,
      percent: Math.round((otherIncome / base) * 1000) / 10,
      color: "#eab308",
    },
    {
      id: "total-profit",
      label: "Total Profit",
      amount: totalProfit,
      percent: Math.round((totalProfit / base) * 1000) / 10,
      color: "#10b981",
    },
  ];

  return { segments, total: totalProfit };
}

function buildProfitBySource(
  totalGrossProfit: number,
  reconditioningProfit: number,
  otherIncome: number,
): CpaProfitSourceItem[] {
  const total = totalGrossProfit + reconditioningProfit + otherIncome;
  const base = total > 0 ? total : 1;

  return [
    {
      id: "vehicle-gross",
      label: "Vehicle Gross Profit",
      amount: totalGrossProfit,
      percent: Math.round((totalGrossProfit / base) * 1000) / 10,
      color: "#22c55e",
    },
    {
      id: "reconditioning",
      label: "Reconditioning Profit",
      amount: reconditioningProfit,
      percent: Math.round((reconditioningProfit / base) * 1000) / 10,
      color: "#3b82f6",
    },
    {
      id: "other-income",
      label: "Other Income",
      amount: otherIncome,
      percent: Math.round((otherIncome / base) * 1000) / 10,
      color: "#eab308",
    },
  ];
}

function buildProfitByVehicleType(vehicles: CpaProfitVehicleRow[]): CpaProfitByTypeItem[] {
  const map = new Map<string, number>();
  for (const vehicle of vehicles) {
    map.set(vehicle.vehicleType, (map.get(vehicle.vehicleType) ?? 0) + vehicle.grossProfit);
  }

  const total = vehicles.reduce((sum, vehicle) => sum + vehicle.grossProfit, 0);
  const base = total > 0 ? total : 1;

  return Array.from(map.entries())
    .map(([label, amount]) => ({
      id: label.toLowerCase(),
      label,
      amount,
      percent: Math.round((amount / base) * 1000) / 10,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function buildCpaProfitVehiclesReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaProfitVehiclesReportData> {
  const bounds = resolveCpaPeriodBounds(params.view, params.month, params.year);
  const { totals, jackets } = await aggregateCpaPeriod(
    dealershipId,
    bounds.start,
    bounds.end,
  );

  const profitableJackets = jackets.filter((row) => Number(row.profit_gross) > 0);
  const vehicles = profitableJackets.map(mapProfitableVehicleRow);

  const totalGrossProfit = vehicles.reduce((sum, row) => sum + row.grossProfit, 0);
  const totalProfit = profitableJackets.reduce(
    (sum, row) => sum + Number(row.profit_net),
    0,
  );
  const totalRevenue = vehicles.reduce((sum, row) => sum + row.salePrice, 0);
  const reconditioningProfit = totals.reconditioning;
  const otherIncome = totals.other_income;

  const breakdown = buildProfitBreakdown(
    totalGrossProfit,
    reconditioningProfit,
    otherIncome,
    totalProfit,
  );

  const periodLabel =
    params.view === "yearly"
      ? `${params.year}`
      : new Date(params.year, params.month - 1, 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

  return {
    periodLabel,
    dataAsOf: new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    kpis: buildKpis(vehicles, totalGrossProfit, totalProfit, totalRevenue),
    profitBreakdown: breakdown.segments,
    profitBreakdownTotal: breakdown.total,
    profitBySource: buildProfitBySource(
      totalGrossProfit,
      reconditioningProfit,
      otherIncome,
    ),
    profitByVehicleType: buildProfitByVehicleType(vehicles),
    vehicles,
    makeOptions: Array.from(new Set(vehicles.map((v) => v.make).filter(Boolean))).sort(),
    vehicleTypeOptions: Array.from(
      new Set(vehicles.map((v) => v.vehicleType).filter(Boolean)),
    ).sort(),
  };
}
