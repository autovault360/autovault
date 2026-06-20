import { createClient } from "@/lib/supabase/server";
import {
  aggregateCpaPeriod,
  type JacketRow,
} from "@/lib/cpa/server/finance/fetch-period-data";
import { resolveCpaPeriodBounds } from "@/lib/cpa/server/finance/period-utils";
import type { CpaViewMode } from "@/lib/cpa/types";
import type {
  CpaLossCategory,
  CpaLossReason,
  CpaVehicleLossRow,
  CpaVehicleLossesReportData,
} from "@/lib/cpa/vehicle-losses-report/types";
import {
  formatReportDate,
  normalizeVehicleType,
} from "@/lib/cpa/vehicle-losses-report/utils";

type VehicleLossRecord = {
  id: string;
  vehicle_id: string;
  loss_date: string;
  loss_reason: string;
  loss_type: string;
  total_investment: number;
  total_expenses: number;
  total_cost_basis: number;
  insurance_proceeds: number;
  net_loss: number;
  vehicle: {
    year: number | null;
    make: string | null;
    model: string | null;
    stock_number: string | null;
    vin: string | null;
    body_style: string | null;
    trim: string | null;
    purchase_type: string | null;
  } | null;
};

function getVehicle<T extends { vehicle: unknown }>(row: T) {
  return Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
}

function isReturnedToAuction(purchaseType: string | null | undefined): boolean {
  const text = (purchaseType ?? "").toLowerCase();
  return text.includes("auction");
}

function inferLossReasonFromJacket(
  purchaseType: string | null | undefined,
  reconditioning: number,
  vehicleCost: number,
): CpaLossReason {
  if (isReturnedToAuction(purchaseType)) return "Overpaid at Auction";
  if (vehicleCost > 0 && reconditioning / vehicleCost >= 0.35) {
    return "High Reconditioning";
  }
  return "Market Depreciation";
}

function mapLossReasonFromRecord(reason: string): CpaLossReason {
  const normalized = reason.toLowerCase();
  if (normalized.includes("mechanical")) return "Mechanical Issues";
  if (normalized.includes("auction") || normalized.includes("overpaid")) {
    return "Overpaid at Auction";
  }
  if (normalized.includes("recondition") || normalized.includes("repair")) {
    return "High Reconditioning";
  }
  if (
    normalized.includes("depreciation") ||
    normalized.includes("market") ||
    normalized.includes("aged")
  ) {
    return "Market Depreciation";
  }
  return "Other";
}

function classifyJacketCategory(purchaseType: string | null | undefined): CpaLossCategory {
  return isReturnedToAuction(purchaseType) ? "returned_to_auction" : "sold_at_loss";
}

function classifyRecordCategory(lossType: string): CpaLossCategory {
  const normalized = lossType.toLowerCase();
  if (normalized.includes("insurance") || normalized.includes("partial")) {
    return "other_adjustments";
  }
  return "unsold_inventory";
}

function mapJacketLossRow(row: JacketRow): CpaVehicleLossRow {
  const vehicle = getVehicle(row);
  const year = vehicle?.year ?? 0;
  const make = vehicle?.make ?? "";
  const model = vehicle?.model ?? "";
  const trim = vehicle?.trim ?? "";
  const vehicleCost = Number(vehicle?.acquisition_cost ?? 0);
  const totalCost = Number(row.total_invested);
  const reconditioning = Math.max(0, totalCost - vehicleCost);
  const salePrice = Number(row.sold_price);
  const lossAmount = Number(row.profit_gross);
  const lossPct =
    totalCost > 0 ? Math.round((lossAmount / totalCost) * 10000) / 100 : 0;
  const category = classifyJacketCategory(vehicle?.purchase_type);
  const dateSold = row.date_sold.split("T")[0] ?? row.date_sold;

  return {
    id: `jacket-${row.id}`,
    stockNumber: vehicle?.stock_number ?? "",
    yearMakeModel: `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`.trim(),
    vin: vehicle?.vin ?? "",
    date: formatReportDate(dateSold),
    status: category === "returned_to_auction" ? "Returned to Auction" : "Sold",
    vehicleCost,
    reconditioning,
    totalCost,
    salePriceOrResult: salePrice,
    lossAmount,
    lossPct,
    lossReason: inferLossReasonFromJacket(
      vehicle?.purchase_type,
      reconditioning,
      vehicleCost,
    ),
    lossCategory: category,
    vehicleType: normalizeVehicleType(vehicle?.body_style, model),
    make,
  };
}

function mapVehicleLossRecordRow(record: VehicleLossRecord): CpaVehicleLossRow {
  const vehicle = getVehicle(record);
  const year = vehicle?.year ?? 0;
  const make = vehicle?.make ?? "";
  const model = vehicle?.model ?? "";
  const trim = vehicle?.trim ?? "";
  const vehicleCost = Number(record.total_investment);
  const reconditioning = Number(record.total_expenses);
  const totalCost = Number(record.total_cost_basis);
  const salePriceOrResult = Number(record.insurance_proceeds);
  const lossAmount = -Math.abs(Number(record.net_loss));
  const lossPct =
    totalCost > 0 ? Math.round((lossAmount / totalCost) * 10000) / 100 : 0;
  const category = classifyRecordCategory(record.loss_type);
  const lossDate = record.loss_date.split("T")[0] ?? record.loss_date;

  return {
    id: `loss-${record.id}`,
    stockNumber: vehicle?.stock_number ?? "",
    yearMakeModel: `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`.trim(),
    vin: vehicle?.vin ?? "",
    date: formatReportDate(lossDate),
    status: category === "unsold_inventory" ? "Unsold Inventory" : "Other Adjustment",
    vehicleCost,
    reconditioning,
    totalCost,
    salePriceOrResult,
    lossAmount,
    lossPct,
    lossReason: mapLossReasonFromRecord(record.loss_reason),
    lossCategory: category,
    vehicleType: normalizeVehicleType(vehicle?.body_style, model),
    make,
  };
}

async function fetchVehicleLossRecords(
  dealershipId: string,
  from: string,
  to: string,
): Promise<VehicleLossRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_losses")
    .select(
      `
      id,
      vehicle_id,
      loss_date,
      loss_reason,
      loss_type,
      total_investment,
      total_expenses,
      total_cost_basis,
      insurance_proceeds,
      net_loss,
      vehicle:vehicles(year, make, model, stock_number, vin, body_style, trim, purchase_type)
    `,
    )
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .gte("loss_date", from)
    .lte("loss_date", to);

  if (error) {
    console.warn("cpa fetchVehicleLossRecords:", error.message);
    return [];
  }

  return (data ?? []) as unknown as VehicleLossRecord[];
}

export async function buildCpaVehicleLossesReport(
  dealershipId: string,
  params: { view: CpaViewMode; month: number; year: number },
): Promise<CpaVehicleLossesReportData> {
  const bounds = resolveCpaPeriodBounds(params.view, params.month, params.year);
  const [{ jackets }, inventoryLosses] = await Promise.all([
    aggregateCpaPeriod(dealershipId, bounds.start, bounds.end),
    fetchVehicleLossRecords(dealershipId, bounds.start, bounds.end),
  ]);

  const soldLossJackets = jackets.filter((row) => Number(row.profit_gross) < 0);
  const jacketVehicleIds = new Set(soldLossJackets.map((row) => row.vehicle_id));

  const jacketRows = soldLossJackets.map(mapJacketLossRow);
  const inventoryRows = inventoryLosses
    .filter((record) => !jacketVehicleIds.has(record.vehicle_id))
    .map(mapVehicleLossRecordRow);

  const vehicles = [...jacketRows, ...inventoryRows].sort((a, b) =>
    a.lossAmount - b.lossAmount,
  );

  const periodLabel =
    params.view === "yearly"
      ? `${params.year}`
      : new Date(params.year, params.month - 1, 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

  const lossReasons = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.lossReason)),
  ).sort() as CpaLossReason[];

  return {
    periodLabel,
    dataAsOf: new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    vehicles,
    makeOptions: Array.from(new Set(vehicles.map((v) => v.make).filter(Boolean))).sort(),
    vehicleTypeOptions: Array.from(
      new Set(vehicles.map((v) => v.vehicleType).filter(Boolean)),
    ).sort(),
    lossReasonOptions: lossReasons,
    statusOptions: Array.from(new Set(vehicles.map((v) => v.status).filter(Boolean))).sort(),
  };
}
