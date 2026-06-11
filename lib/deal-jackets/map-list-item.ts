import type { CommissionStatus, DealJacketListItem, DealJacketStatus, PaymentMethod } from "./types";
import type { DealJacketListItemDto } from "./server/list-deal-jackets";
import { normalizeCommissionStatus } from "@/lib/sales-rep/commissions/normalize-status";

const DEFAULT_PAYMENT: PaymentMethod = "finance";

export function mapDealJacketListDto(
  dto: DealJacketListItemDto,
): DealJacketListItem {
  const validStatuses = [
    "pending_review",
    "changes_requested",
    "resubmitted",
    "approved",
    "rejected",
  ];
  const rawStatus = dto.workflowStatus ?? "pending_review";
  const workflowStatus: DealJacketStatus = validStatuses.includes(rawStatus)
    ? (rawStatus as DealJacketStatus)
    : "pending_review";

  const commissionStatus: CommissionStatus = normalizeCommissionStatus(
    dto.commission?.status ?? dto.commissionStatus,
  );

  return {
    id: dto.id,
    vehicleId: dto.vehicleId,
    year: dto.year,
    make: dto.make,
    model: dto.model,
    stockNumber: dto.stockNumber,
    vin: dto.vin,
    imageUrl: dto.imageUrl,
    customerName: dto.customerName,
    customerPhone: dto.customerPhone ?? "",
    saleDate: dto.saleDate,
    salePrice: dto.salePrice,
    totalProfit: dto.totalProfit,
    salesRepId: dto.salesRepId ?? "unassigned",
    salesRepName: dto.salesRepName,
    commissionAmount: dto.commissionAmount,
    commissionStatus,
    paymentMethod: DEFAULT_PAYMENT,
    workflowStatus,
  };
}

export function buildSalesRepFilterOptions(
  items: DealJacketListItem[],
): { id: string; label: string }[] {
  const byId = new Map<string, string>();
  for (const item of items) {
    if (item.salesRepId && item.salesRepId !== "unassigned") {
      byId.set(item.salesRepId, item.salesRepName);
    }
  }
  return [
    { id: "all", label: "All Sales Reps" },
    ...Array.from(byId.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({ id, label })),
  ];
}
