import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";

const totalSalePrice = 21096;
const vehicleExpenses = 3542.85;
const purchasePrice = 14200;
const grossProfit = 3357.15;
const netProfit = 2506.15;
const commissionAmount = 850.5;

export function buildReferenceExpenses(
  count: number,
): DealJacketDetail["expenses"] {
  const items = [
    { name: "Brake & Rotor Replacement", category: "Repairs", amount: 850 },
    { name: "Full Detail Package", category: "Reconditioning", amount: 425 },
    { name: "Smog Certification", category: "Compliance", amount: 89 },
    { name: "Transport from Auction", category: "Transport", amount: 275 },
    { name: "Facebook Ads Allocation", category: "Advertising", amount: 125 },
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `exp-${i + 1}`,
    name: items[i % items.length].name,
    category: items[i % items.length].category,
    date: `2025-05-${String(Math.max(1, 28 - (i % 20))).padStart(2, "0")}`,
    amount: items[i % items.length].amount + (i % 3) * 25,
    notes: i % 4 === 0 ? "Approved by manager" : null,
  }));
}

export function buildReferenceDocuments(
  count: number,
): DealJacketDetail["documents"] {
  const names = [
    { name: "Bill of Sale", icon: "contract" as const },
    { name: "Purchase Agreement", icon: "contract" as const },
    { name: "Buyer ID ... Front", icon: "license" as const },
    { name: "Insurance Declaration", icon: "insurance" as const },
    { name: "Funding Authorization", icon: "generic" as const },
  ];
  return Array.from({ length: Math.min(5, count) }, (_, i) => ({
    id: `doc-${i + 1}`,
    name: names[i].name,
    type: "document" as const,
    uploadedAt: `2025-05-${String(28 - i).padStart(2, "0")}`,
    icon: names[i].icon,
  }));
}

export function buildReferenceReceipts(
  count: number,
): DealJacketDetail["receipts"] {
  const names = [
    { name: "Down Payment Receipt", icon: "receipt" as const },
    { name: "Smog Certificate", icon: "receipt" as const },
    { name: "Detail Receipt", icon: "receipt" as const },
    { name: "Parts Invoice", icon: "receipt" as const },
    { name: "DMV Fee Receipt", icon: "receipt" as const },
  ];
  return Array.from({ length: Math.min(5, count) }, (_, i) => ({
    id: `rcpt-${i + 1}`,
    name: names[i].name,
    type: "receipt" as const,
    uploadedAt: `2025-05-${String(27 - i).padStart(2, "0")}`,
    icon: names[i].icon,
  }));
}

export function buildReferenceActivities(): DealJacketDetail["activities"] {
  return [
    {
      id: "act-1",
      label: "Vehicle marked sold",
      detail: "Deal closed and jacket created",
      occurredAt: "2025-05-31T14:00:00",
      actor: "Sarah Williams",
    },
    {
      id: "act-2",
      label: "Commission paid",
      detail: "ACH transfer completed",
      occurredAt: "2025-06-05T09:30:00",
      actor: "System",
    },
    {
      id: "act-3",
      label: "Documents uploaded",
      detail: "Signed contract and buyer ID added",
      occurredAt: "2025-05-31T15:20:00",
      actor: "Sarah Williams",
    },
    {
      id: "act-4",
      label: "Deal jacket created",
      detail: "Digital folder initialized for sold vehicle",
      occurredAt: "2025-05-31T14:05:00",
      actor: "John Doe",
    },
    {
      id: "act-5",
      label: "Funding received",
      detail: "Lender funding confirmed",
      occurredAt: "2025-05-31T16:00:00",
      actor: "System",
    },
    {
      id: "act-6",
      label: "ROS filed",
      detail: "Report of sale submitted to DMV",
      occurredAt: "2025-06-01T10:00:00",
      actor: "Sarah Williams",
    },
    {
      id: "act-7",
      label: "Customer follow-up scheduled",
      detail: "Referral check-in set for 30 days",
      occurredAt: "2025-05-31T17:00:00",
      actor: "John Doe",
    },
    {
      id: "act-8",
      label: "Expense receipt added",
      detail: "Detail receipt uploaded",
      occurredAt: "2025-05-28T11:30:00",
      actor: "Sarah Williams",
    },
    {
      id: "act-9",
      label: "Insurance verified",
      detail: "Insurance declaration on file",
      occurredAt: "2025-05-30T09:15:00",
      actor: "John Doe",
    },
    {
      id: "act-10",
      label: "Down payment recorded",
      detail: "Cashier's check deposited",
      occurredAt: "2025-05-31T13:00:00",
      actor: "System",
    },
    {
      id: "act-11",
      label: "Vehicle delivered",
      detail: "Customer took delivery",
      occurredAt: "2025-05-31T18:00:00",
      actor: "Sarah Williams",
    },
    {
      id: "act-12",
      label: "Note updated",
      detail: "Deal note revised",
      occurredAt: "2025-05-31T09:15:00",
      actor: "John Doe",
    },
  ];
}

/** Pixel-perfect reference deal jacket (DJ-000156 / deal-0001). */
export const DEAL_JACKET_DETAIL_REFERENCE: DealJacketDetail = {
  id: "deal-0001",
  jacketNumber: "DJ-000156",
  vehicleId: "vehicle-1001",
  soldStatus: "sold",
  vehicle: {
    imageUrl:
      "https://images.unsplash.com/photo-1623869678934-9bfc94ca5792?w=400&h=260&fit=crop",
    year: 2020,
    make: "Honda",
    model: "Accord",
    trim: "LX",
    displayName: "2020 Honda Accord LX",
    stockNumber: "1008",
    vin: "1HGCV1F14LA123456",
    mileage: 45210,
    color: "Silver",
    purchasePrice,
    totalInvested: purchasePrice + vehicleExpenses,
    soldPrice: 18900,
    grossProfit,
    netProfit,
  },
  customer: {
    id: "cust-1008",
    name: "Michael Johnson",
    phone: "(555) 234-5678",
    email: "michael.johnson@email.com",
    address: "742 Evergreen Terrace, Springfield, CA 90210",
    driversLicense: "D1234567",
    notes: "Preferred contact by phone. Referred by existing customer.",
  },
  sale: {
    dateSold: "2025-05-31",
    soldPrice: 18900,
    salesTax: 1512,
    licenseFee: 125,
    registrationFee: 89,
    dmvFees: 175,
    documentationFee: 295,
    totalSalePrice,
    downPayment: 5000,
    amountFinanced: 16096,
    balanceDue: 0,
    paymentMethod: "check",
    paymentMethodLabel: "Cashier's Check",
    rosNumber: "ROS-2025-88421",
  },
  salesRep: {
    id: "rep-2",
    name: "Sarah Williams",
    commissionType: "Percentage",
    commissionPercent: 15,
    commissionAmount,
    commissionStatus: "paid",
    commissionPaidDate: "2025-06-05",
    commissionPaymentMethod: "ACH",
    transactionId: "TXN-ACH-92847102",
  },
  financial: {
    purchasePrice,
    vehicleExpenses,
    totalInvested: purchasePrice + vehicleExpenses,
    totalSalePrice,
    grossProfit,
    commissionDeduction: commissionAmount,
    additionalCosts: 349.77,
    netProfit,
  },
  expenseBreakdown: [
    {
      label: "Repairs & Maintenance",
      amount: 1850,
      percent: 52.2,
      color: "#3b82f6",
    },
    {
      label: "Advertising",
      amount: 312.85,
      percent: 8.8,
      color: "#f97316",
    },
    {
      label: "Detail & Reconditioning",
      amount: 680,
      percent: 19.2,
      color: "#22c55e",
    },
    {
      label: "Fees & Inspections",
      amount: 425,
      percent: 12.0,
      color: "#eab308",
    },
    {
      label: "Other Expenses",
      amount: 275,
      percent: 7.8,
      color: "#ef4444",
    },
  ],
  expenses: buildReferenceExpenses(24),
  documents: buildReferenceDocuments(18),
  receipts: buildReferenceReceipts(32),
  documentChecklist: [
    { label: "Driver License", uploaded: true },
    { label: "Insurance Card", uploaded: true },
    { label: "Signed Contract", uploaded: true },
    { label: "Buyer Documents", uploaded: true },
  ],
  activities: buildReferenceActivities(),
  workflowStatus: "approved",
  workflowActivities: [
    {
      id: "wfa-1",
      deal_jacket_id: "deal-0001",
      action: "created",
      actor_id: "user-1",
      actor_name: "Sarah Williams",
      old_status: null,
      new_status: "pending_review",
      detail: null,
      created_at: "2025-05-30T10:00:00Z",
    },
    {
      id: "wfa-2",
      deal_jacket_id: "deal-0001",
      action: "approved",
      actor_id: "user-2",
      actor_name: "John Doe",
      old_status: "pending_review",
      new_status: "approved",
      detail: { reviewNotes: "All documents verified." },
      created_at: "2025-05-31T09:00:00Z",
    },
  ],
  reviewNotes: "All documents verified. Commission approved.",
  reviewedBy: "user-2",
  reviewedAt: "2025-05-31T09:00:00Z",
  changeCategories: null,
  rejectionReason: null,
  dealNotes: "Customer was very satisfied. Follow up for referral.",
  internalNotes: "Deal funded same day. All documents verified at closing.",
  lastNoteBy: "John Doe",
  lastNoteAt: "2025-05-31T09:15:00",
  tabCounts: {
    documents: 18,
    expenses: 24,
    receipts: 32,
    history: 12,
    notes: 3,
  },
};
