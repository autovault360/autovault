import type {
  CommissionStatus,
  DealJacketListItem,
  DealJacketStatus,
  DealJacketTabCounts,
} from "./types";
import {
  isSoldInReferenceMonth,
  isSoldInReferenceYear,
} from "./period-utils";

const SALES_REPS = [
  { id: "rep-1", name: "Mike Thompson" },
  { id: "rep-2", name: "Sarah Williams" },
  { id: "rep-3", name: "James Rodriguez" },
  { id: "rep-4", name: "Emily Chen" },
];

const VEHICLES = [
  { year: 2019, make: "Honda", model: "Civic" },
  { year: 2020, make: "Toyota", model: "Camry" },
  { year: 2021, make: "Ford", model: "F-150" },
  { year: 2018, make: "Chevrolet", model: "Malibu" },
  { year: 2022, make: "BMW", model: "3 Series" },
  { year: 2019, make: "Nissan", model: "Altima" },
  { year: 2020, make: "Hyundai", model: "Elantra" },
  { year: 2021, make: "Jeep", model: "Grand Cherokee" },
];

const CUSTOMERS = [
  { name: "Robert Johnson", phone: "(555) 234-5678" },
  { name: "Maria Garcia", phone: "(555) 345-6789" },
  { name: "David Lee", phone: "(555) 456-7890" },
  { name: "Jennifer Smith", phone: "(555) 567-8901" },
  { name: "Michael Brown", phone: "(555) 678-9012" },
  { name: "Amanda Wilson", phone: "(555) 789-0123" },
];

const PAYMENT_METHODS = [
  "cash",
  "finance",
  "check",
  "wire",
  "credit_card",
] as const;

const COMMISSION_STATUSES: CommissionStatus[] = [
  "pending_review",
  "changes_requested",
  "resubmitted",
  "approved",
  "rejected",
  "paid",
];

const PENDING_INDICES = new Set([
  4, 7, 12, 18, 25, 31, 38, 44, 52, 61, 68, 75, 82, 91, 98, 105, 112, 120,
  128, 135, 142, 149, 155,
]);

function buildVin(index: number): string {
  return `1HGBH41JXMN${String(109186 + index).padStart(6, "0")}`;
}

function saleDateForIndex(index: number): string {
  if (index < 18) {
    const day = Math.min(28, index + 1);
    return `2025-05-${String(day).padStart(2, "0")}`;
  }
  if (index < 86) {
    const month = 1 + ((index - 18) % 4);
    const day = (index % 27) + 1;
    return `2025-0${month}-${String(day).padStart(2, "0")}`;
  }
  const year = 2023 + ((index - 86) % 2);
  const month = (index % 12) + 1;
  const day = (index % 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const WORKFLOW_STATUSES: DealJacketStatus[] = [
  "pending_review",
  "changes_requested",
  "resubmitted",
  "approved",
  "rejected",
];

export const DEAL_JACKETS_MOCK: DealJacketListItem[] = Array.from(
  { length: 156 },
  (_, index) => {
    const vehicle = VEHICLES[index % VEHICLES.length];
    const customer = CUSTOMERS[index % CUSTOMERS.length];
    const rep = SALES_REPS[index % SALES_REPS.length];
    const salePrice = 12500 + (index % 40) * 425 + (index % 7) * 150;
    const totalProfit =
      Math.round(salePrice * (0.08 + (index % 5) * 0.015) * 100) / 100;
    const commissionAmount = Math.round(totalProfit * 0.2 * 100) / 100;
    const commissionStatus = PENDING_INDICES.has(index)
      ? "pending_review"
      : COMMISSION_STATUSES[index % COMMISSION_STATUSES.length];
    const stockNum = 1001 + index;
    const workflowStatus = WORKFLOW_STATUSES[index % WORKFLOW_STATUSES.length];

    return {
      id: `deal-${String(index + 1).padStart(4, "0")}`,
      vehicleId: `vehicle-${stockNum}`,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      stockNumber: String(stockNum),
      vin: buildVin(index),
      imageUrl: `https://picsum.photos/seed/deal-${index}/96/64`,
      customerName: customer.name,
      customerPhone: customer.phone,
      saleDate: saleDateForIndex(index),
      salePrice,
      totalProfit,
      salesRepId: rep.id,
      salesRepName: rep.name,
      commissionAmount,
      commissionStatus,
      paymentMethod: PAYMENT_METHODS[index % PAYMENT_METHODS.length],
      soldStatus: "sold",
      workflowStatus,
    };
  },
);

DEAL_JACKETS_MOCK[0] = {
  ...DEAL_JACKETS_MOCK[0],
  year: 2020,
  make: "Honda",
  model: "Accord",
  stockNumber: "1008",
  vin: "1HGCV1F14LA123456",
  imageUrl:
    "https://images.unsplash.com/photo-1623869678934-9bfc94ca5792?w=400&h=260&fit=crop",
  customerName: "Michael Johnson",
  customerPhone: "(555) 234-5678",
  saleDate: "2025-05-31",
  salePrice: 18900,
  totalProfit: 2506.15,
  salesRepName: "Sarah Williams",
  salesRepId: "rep-2",
  commissionAmount: 850.5,
  commissionStatus: "paid",
  paymentMethod: "check",
};

export function computeDealJacketTabCounts(
  items: DealJacketListItem[],
): DealJacketTabCounts {
  return {
    all: items.length,
    sold_this_month: items.filter((i) => isSoldInReferenceMonth(i.saleDate))
      .length,
    sold_this_year: items.filter((i) => isSoldInReferenceYear(i.saleDate))
      .length,
    pending_commission: items.filter((i) =>
      i.commissionStatus !== "paid" && i.commissionStatus !== "rejected"
    ).length,
    commission_paid: items.filter((i) => i.commissionStatus === "paid").length,
  };
}

export const DEAL_JACKET_TAB_COUNTS = computeDealJacketTabCounts(DEAL_JACKETS_MOCK);

export const SALES_REP_FILTER_OPTIONS = [
  { id: "all", label: "All Sales Reps" },
  ...SALES_REPS.map((r) => ({ id: r.id, label: r.name })),
];
