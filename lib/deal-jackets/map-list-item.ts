import type { DealJacketListItem, PaymentMethod } from "./types";
import type { DealJacketListItemDto } from "./server/list-deal-jackets";

const DEFAULT_PAYMENT: PaymentMethod = "finance";

export function mapDealJacketListDto(
  dto: DealJacketListItemDto,
): DealJacketListItem {
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
    commissionStatus:
      dto.commissionStatus === "paid" ? "paid" : "pending",
    paymentMethod: DEFAULT_PAYMENT,
    soldStatus: "sold",
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
