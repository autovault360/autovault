import type { ExpenseCategory, ExpenseDetail } from "../types";
import { formatCategory } from "../types";

export type ExpenseKind = "dealership" | "vehicle";

export type ExpenseActionResult =
  | { success: true; expenseId?: string }
  | { success: false; error: string };

export type LinkedVehicleResult = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  stockNumber: string;
  vin: string;
  mileage: number;
  color: string;
  status: string;
  image: string;
  location?: string;
  acquisitionCost?: number;
  totalInvested?: number;
};

export type DbDealershipExpense = {
  id: string;
  dealership_id: string;
  expense_date: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  reference_number: string | null;
  payment_method: string | null;
  tax_deductible: boolean;
  is_recurring: boolean;
  recurrence_frequency: string | null;
  recurrence_next_due_date: string | null;
  receipt_storage_path: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  users?: { full_name: string | null } | null;
};

function mapRecurrenceFrequency(
  value: string | null | undefined,
  isRecurring: boolean,
): ExpenseDetail["frequency"] {
  if (!isRecurring) return "one_time";
  switch (value) {
    case "weekly":
      return "weekly";
    case "quarterly":
      return "quarterly";
    case "yearly":
      return "yearly";
    case "monthly":
    default:
      return "monthly";
  }
}

function mapDealershipPaymentStatus(
  row: DbDealershipExpense,
): ExpenseDetail["paymentStatus"] {
  if (
    row.is_recurring &&
    row.recurrence_next_due_date &&
    row.recurrence_next_due_date > new Date().toISOString().split("T")[0]
  ) {
    return "unpaid";
  }
  return "paid";
}

export type DbVehicleExpense = {
  id: string;
  vehicle_id: string;
  dealership_id: string;
  repair_date: string;
  category: string;
  repair_type: string;
  expense_subcategory: string | null;
  expense_name: string | null;
  description: string;
  shop_vendor: string | null;
  total_cost: number;
  vehicle_notes_amount: number;
  payment_method: string | null;
  payment_status: string | null;
  invoice_number: string | null;
  receipt_storage_path: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  vehicles?: {
    year: number;
    make: string;
    model: string;
    trim: string | null;
    stock_number: string | null;
    vin: string;
  } | null;
  users?: { full_name: string | null } | null;
};

const PAYMENT_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  check: "Check",
  ach: "ACH",
  cash: "Cash",
  debit_card: "Debit Card",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  needs_attention: "Needs Attention",
  pending_deal: "Pending Deal",
  sold: "Sold",
  loss: "Loss",
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  brakes: "Brakes",
  tires: "Tires",
  engine: "Engine",
  transmission: "Transmission",
  paint_body: "Paint & Body",
  detail: "Detail",
  smog: "Smog",
  inspection: "Inspection",
  towing: "Towing",
  parts: "Parts",
  labor: "Labor",
  keys: "Keys",
  registration: "Registration",
  other: "Other",
};

export function formatPaymentMethod(value: string | null | undefined): string {
  if (!value) return "...";
  return PAYMENT_LABELS[value] ?? value;
}

export function mapDealershipCategory(
  category: string,
  isRecurring: boolean,
): ExpenseCategory {
  if (isRecurring) return "recurring";
  const valid: ExpenseCategory[] = [
    "advertising",
    "accounting",
    "office",
    "salary_wages",
    "software",
    "utilities",
    "rent",
    "insurance",
    "other",
  ];
  if (valid.includes(category as ExpenseCategory)) {
    return category as ExpenseCategory;
  }
  return "other";
}

export function mapDealershipExpense(
  row: DbDealershipExpense,
  receiptUrl: string | null,
  addedByName: string,
): ExpenseDetail {
  const category = mapDealershipCategory(row.category, row.is_recurring);
  const isRecurring = row.is_recurring;
  const frequency = mapRecurrenceFrequency(row.recurrence_frequency, isRecurring);
  const dueDate = row.recurrence_next_due_date ?? row.expense_date;
  const displayName = row.description.trim() || row.vendor;

  return {
    id: row.id,
    expenseKind: "dealership",
    date: row.expense_date,
    category,
    title: displayName.slice(0, 80),
    subtitle: row.vendor,
    hasReceipt: !!row.receipt_storage_path,
    paymentMethod: formatPaymentMethod(row.payment_method),
    amount: Number(row.amount),
    vendor: row.vendor,
    expenseName: displayName,
    displayName,
    dueDate,
    isRecurring,
    frequency,
    paymentStatus: mapDealershipPaymentStatus(row),
    vehicleNotesAmount: 0,
    linkedVehicle: null,
    stockNumber: null,
    vehicleId: null,
    vehicleVin: null,
    expenseSubcategory: null,
    transactionId: row.reference_number ?? row.id.slice(0, 8).toUpperCase(),
    receiptUploadedAt: row.receipt_storage_path ? row.created_at : null,
    notes: row.notes,
    addedBy: addedByName,
    description: row.description,
    createdAt: row.created_at,
    receiptImageUrl: receiptUrl,
  };
}

export function mapVehicleExpense(
  row: DbVehicleExpense,
  receiptUrl: string | null,
  addedByName: string,
): ExpenseDetail {
  const vehicle = row.vehicles;
  const subcategory = row.expense_subcategory ?? row.repair_type;
  const subLabel = SUBCATEGORY_LABELS[subcategory] ?? subcategory;
  const vehicleLabel = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : null;
  const displayName =
    row.expense_name?.trim() ||
    (vehicle ? `${subLabel} - Stock #${vehicle.stock_number ?? "..."}` : subLabel);
  const paymentStatus =
    row.payment_status === "unpaid" || row.payment_status === "partial"
      ? row.payment_status
      : "paid";

  return {
    id: row.id,
    expenseKind: "vehicle",
    date: row.repair_date,
    category: "vehicle",
    title: displayName,
    subtitle: row.shop_vendor ?? "...",
    hasReceipt: !!row.receipt_storage_path,
    paymentMethod: formatPaymentMethod(row.payment_method),
    amount: Number(row.total_cost),
    vendor: row.shop_vendor ?? "...",
    expenseName: row.expense_name,
    displayName,
    dueDate: row.repair_date,
    isRecurring: false,
    frequency: "one_time",
    paymentStatus,
    vehicleNotesAmount: Number(row.vehicle_notes_amount ?? 0),
    linkedVehicle: vehicleLabel,
    stockNumber: vehicle?.stock_number ?? null,
    vehicleId: row.vehicle_id,
    vehicleVin: vehicle?.vin ?? null,
    expenseSubcategory: subLabel,
    transactionId: row.invoice_number ?? row.id.slice(0, 8).toUpperCase(),
    receiptUploadedAt: row.receipt_storage_path ? row.created_at : null,
    notes: row.notes,
    addedBy: addedByName,
    description: row.description,
    createdAt: row.created_at,
    receiptImageUrl: receiptUrl,
  };
}

export function getVehicleDisplayName(vehicle: LinkedVehicleResult): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim();
}

export function mapVehicleStatus(dbStatus: string): string {
  return STATUS_LABELS[dbStatus] ?? dbStatus;
}

export function formatCategoryLabel(category: ExpenseCategory): string {
  return formatCategory(category);
}
