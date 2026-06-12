import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import { totalVehicleCost } from "@/lib/dealer/dashboard/calculations";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportInventoryCsv(vehicles: WholesaleVehicle[]): void {
  const headers = [
    "Stock #",
    "Year",
    "Make",
    "Model",
    "Trim",
    "VIN",
    "Odometer",
    "Condition",
    "Location",
    "Date Acquired",
    "Cost",
    "Wholesale Value",
    "Sold Price",
    "Profit",
    "Days in Inventory",
    "Inventory Status",
    "Title Status",
    "Payment Status",
  ];

  const rows = vehicles.map((v) =>
    [
      v.stockNumber,
      String(v.year),
      v.make,
      v.model,
      v.trim ?? "",
      v.vin,
      v.mileage != null ? String(v.mileage) : "",
      v.condition ?? "",
      v.location,
      v.purchaseDate,
      totalVehicleCost(v.costs).toFixed(2),
      v.wholesaleValue.toFixed(2),
      v.soldPrice != null ? v.soldPrice.toFixed(2) : "",
      v.profit != null ? v.profit.toFixed(2) : "",
      String(v.daysInLot),
      v.inventoryStatus,
      v.titleStatus,
      v.paymentStatus ?? "",
    ]
      .map((cell) => escapeCsv(cell))
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportInventorySummaryLabel(vehicles: WholesaleVehicle[]): string {
  return `${vehicles.length} vehicles - ${vehicles.map((v) => getVehicleLabel(v)).slice(0, 3).join(", ")}${vehicles.length > 3 ? "..." : ""}`;
}
