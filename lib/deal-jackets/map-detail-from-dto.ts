import type { DealJacketDetailDto } from "./server/get-deal-jacket-by-id";
import type {
  DealJacketDetail,
  ExpenseCategoryBreakdown,
  DealJacketFileItem,
} from "./detail-types";
import type { CommissionStatus, PaymentMethod } from "./types";

const CATEGORY_COLORS: Record<string, string> = {
  repairs: "#3b82f6",
  maintenance: "#3b82f6",
  reconditioning: "#22c55e",
  detail: "#22c55e",
  advertising: "#f97316",
  transport: "#8b5cf6",
  compliance: "#eab308",
  fees: "#eab308",
  other: "#ef4444",
};

function documentIcon(name: string): DealJacketFileItem["icon"] {
  const lower = name.toLowerCase();
  if (lower.includes("license") || lower.includes("id")) return "license";
  if (lower.includes("insurance")) return "insurance";
  if (lower.includes("contract") || lower.includes("sale") || lower.includes("agreement")) {
    return "contract";
  }
  if (lower.includes("receipt")) return "receipt";
  return "generic";
}

function buildExpenseBreakdown(
  expenses: DealJacketDetailDto["expenses"],
  totalVehicleExpenses: number,
): ExpenseCategoryBreakdown[] {
  if (expenses.length === 0) {
    return [
      {
        label: "Vehicle Expenses",
        amount: totalVehicleExpenses,
        percent: 100,
        color: "#3b82f6",
      },
    ];
  }

  const byCategory = new Map<string, number>();
  for (const exp of expenses) {
    const key = exp.category || "Other";
    byCategory.set(key, (byCategory.get(key) ?? 0) + exp.amount);
  }

  const total = Array.from(byCategory.values()).reduce((s, v) => s + v, 0) || 1;

  return Array.from(byCategory.entries()).map(([label, amount]) => ({
    label,
    amount: Math.round(amount * 100) / 100,
    percent: Math.round((amount / total) * 100),
    color:
      CATEGORY_COLORS[label.toLowerCase()] ??
      CATEGORY_COLORS[label.toLowerCase().split(" ")[0]] ??
      "#64748b",
  }));
}

function buildDocumentChecklist(
  documents: DealJacketDetailDto["documents"],
): DealJacketDetail["documentChecklist"] {
  const names = documents.map((d) => d.name.toLowerCase());
  const has = (term: string) => names.some((n) => n.includes(term));

  return [
    { label: "Driver License", uploaded: has("license") || has("driver") },
    { label: "Insurance Card", uploaded: has("insurance") },
    { label: "Signed Contract", uploaded: has("contract") || has("sale") || has("agreement") },
    { label: "Buyer Documents", uploaded: has("buyer") || has("id") },
  ];
}

function mapFileItems(
  documents: DealJacketDetailDto["documents"],
  type: "document" | "receipt",
): DealJacketFileItem[] {
  return documents
    .filter((d) =>
      type === "receipt"
        ? d.name.toLowerCase().includes("receipt")
        : !d.name.toLowerCase().includes("receipt"),
    )
    .map((doc) => ({
      id: doc.id,
      name: doc.name,
      type,
      uploadedAt: doc.uploadedAt.split("T")[0],
      icon: documentIcon(doc.name),
    }));
}

export function mapDealJacketDetailFromDto(
  dto: DealJacketDetailDto,
  options?: { rosNumber?: string | null; dealNotes?: string | null },
): DealJacketDetail {
  const fees = dto.fees ?? {};
  const licenseFee = Number(fees.license ?? 0);
  const registrationFee = Number(fees.registration ?? 0);
  const dmvFees = Number(fees.dmv ?? 0);
  const documentationFee = Number(fees.documentation ?? 0);

  const expenseSum = dto.expenses.reduce((s, e) => s + e.amount, 0);
  const purchasePrice =
    dto.vehicle.acquisitionCost != null && dto.vehicle.acquisitionCost > 0
      ? dto.vehicle.acquisitionCost
      : Math.max(0, dto.totalInvested - expenseSum);
  const vehicleExpenses = Math.max(0, dto.totalInvested - purchasePrice);
  const commissionStatus: CommissionStatus =
    dto.commissionStatus === "paid" ? "paid" : "pending";
  const commissionRate = dto.salesRep?.commissionRate ?? 0.1;
  const commissionPercent = Math.round(commissionRate * 1000) / 10;
  const saleDate = dto.dateSold.split("T")[0];

  const documents = mapFileItems(dto.documents, "document");
  const receipts = mapFileItems(dto.documents, "receipt");
  const expenses = dto.expenses.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    date: e.date,
    amount: e.amount,
    notes: null,
  }));

  const repName = dto.salesRep?.name ?? "...";
  const activities: DealJacketDetail["activities"] = [
    {
      id: "act-created",
      label: "Deal jacket created",
      detail: `${dto.jacketNumber} recorded for sold vehicle`,
      occurredAt: dto.createdAt,
      actor: repName,
    },
  ];

  if (commissionStatus === "paid") {
    activities.unshift({
      id: "act-commission",
      label: "Commission paid",
      detail: formatCurrency(dto.commissionAmount),
      occurredAt: dto.createdAt,
      actor: repName,
    });
  }

  return {
    id: dto.id,
    jacketNumber: dto.jacketNumber,
    vehicleId: dto.vehicleId,
    soldStatus: "sold",
    vehicle: {
      imageUrl: dto.vehicle.imageUrl,
      year: dto.vehicle.year,
      make: dto.vehicle.make,
      model: dto.vehicle.model,
      trim: dto.vehicle.trim ?? "",
      displayName: `${dto.vehicle.year} ${dto.vehicle.make} ${dto.vehicle.model}`.trim(),
      stockNumber: dto.vehicle.stockNumber,
      vin: dto.vehicle.vin,
      mileage: dto.vehicle.mileage ?? 0,
      color: dto.vehicle.color ?? "...",
      purchasePrice,
      totalInvested: dto.totalInvested,
      soldPrice: dto.soldPrice,
      grossProfit: dto.profitGross,
      netProfit: dto.profitNet,
    },
    customer: {
      id: dto.customer.id,
      name: dto.customer.name,
      phone: dto.customer.phone ?? "...",
      email: dto.customer.email ?? "...",
      address: dto.customer.address ?? "...",
      driversLicense: "...",
      notes: null,
    },
    sale: {
      dateSold: saleDate,
      soldPrice: dto.soldPrice,
      salesTax: dto.totalTax,
      licenseFee,
      registrationFee,
      dmvFees,
      documentationFee,
      totalSalePrice: dto.totalSalePrice,
      downPayment: dto.downPayment,
      amountFinanced: dto.amountFinanced,
      balanceDue: dto.balanceDue,
      paymentMethod: "finance" as PaymentMethod,
      paymentMethodLabel: "Finance",
      rosNumber: options?.rosNumber ?? `ROS-${saleDate.slice(0, 4)}-${dto.vehicle.stockNumber}`,
    },
    salesRep: {
      id: dto.salesRep?.id ?? dto.salesRepId ?? "unassigned",
      name: repName,
      commissionType: "Percentage",
      commissionPercent,
      commissionAmount: dto.commissionAmount,
      commissionStatus,
      commissionPaidDate: commissionStatus === "paid" ? saleDate : null,
      commissionPaymentMethod: commissionStatus === "paid" ? "ACH" : "...",
      transactionId:
        commissionStatus === "paid"
          ? `TXN-${dto.jacketNumber.replace(/\D/g, "").slice(-6)}`
          : null,
    },
    financial: {
      purchasePrice,
      vehicleExpenses,
      totalInvested: dto.totalInvested,
      totalSalePrice: dto.totalSalePrice,
      grossProfit: dto.profitGross,
      commissionDeduction: dto.commissionAmount,
      additionalCosts: dto.additionalExpenses,
      netProfit: dto.profitNet,
    },
    expenseBreakdown: buildExpenseBreakdown(dto.expenses, vehicleExpenses),
    expenses,
    documents,
    receipts,
    documentChecklist: buildDocumentChecklist(dto.documents),
    activities,
    dealNotes: options?.dealNotes?.trim() || "No additional notes on file.",
    internalNotes: "",
    lastNoteBy: repName,
    lastNoteAt: saleDate,
    tabCounts: {
      documents: Math.max(documents.length, 1),
      expenses: Math.max(expenses.length, 1),
      receipts: Math.max(receipts.length, 1),
      history: activities.length,
      notes: options?.dealNotes?.trim() ? 1 : 0,
    },
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
