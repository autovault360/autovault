import { formatAlertDate, getVehicleLabel } from "./calculations";
import { formatCommissionPrice } from "@/lib/sales-rep/commissions/format";
import type { ISalesRepVehicleAlert } from "./types";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending Approval",
  pending_documents: "Pending Documents",
  under_review: "Under Review",
  needs_changes: "Needs Changes",
  resolved: "Resolved",
};

export function exportVehicleAlertsCsv(
  alerts: ISalesRepVehicleAlert[],
  filename = "vehicle-alerts.csv",
): void {
  const headers = [
    "Vehicle",
    "VIN",
    "Stock #",
    "Customer",
    "Phone",
    "Sold Date",
    "Sold Price",
    "Deal Jacket",
    "Alert Type",
    "Priority",
    "Status",
    "Pending Since",
    "Due Date",
    "Assigned To",
    "Alert Title",
  ];

  const rows = alerts.map((a) => [
    getVehicleLabel(a),
    a.vin,
    a.stockNumber,
    a.customerName,
    a.customerPhone,
    formatAlertDate(a.soldDate),
    formatCommissionPrice(a.soldPrice),
    a.dealJacketId,
    a.alertType,
    a.priority,
    STATUS_LABELS[a.status] ?? a.status,
    formatAlertDate(a.pendingSince),
    formatAlertDate(a.dueDate),
    a.assignedTo,
    a.alertTitle,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
