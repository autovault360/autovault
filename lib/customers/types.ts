export type CustomerStatus = "lead" | "active_deal" | "customer";
export type CustomerType = "individual" | "dealer" | "wholesale";
export type CustomerSource =
  | "website"
  | "referral"
  | "walk_in"
  | "ads"
  | "social_media"
  | "other";
export type CommunicationType =
  | "email"
  | "call"
  | "sms"
  | "meeting"
  | "inquiry";

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  imageUrl: string | null;
  type: CustomerType;
  status: CustomerStatus;
  source: CustomerSource | null;
  salesRepId: string | null;
  salesRepName: string;
  customerSince: string;
  lastActivityDate: string;
  lastActivityLabel: string;
  lifetimeValue: number;
  vehicleCount: number;
  dealsCount: number;
};

export type CustomerStats = {
  totalCustomers: number;
  newCustomersMtd: number;
  activeDeals: number;
  totalSalesMtd: number;
  totalCustomersDelta: string;
  totalCustomersDeltaColor: "green" | "red";
  newCustomersDelta: string;
  newCustomersDeltaColor: "green" | "red";
  activeDealsDelta: string;
  activeDealsDeltaColor: "green" | "red";
  totalSalesDelta: string;
  totalSalesDeltaColor: "green" | "red";
};

export type SalesRepOption = {
  id: string;
  fullName: string;
};

export type PurchaseHistoryItem = {
  id: string;
  stockNumber: string;
  vehicleName: string;
  saleDate: string;
  salePrice: number;
  grossProfit: number;
};

export type CustomerDealItem = {
  id: string;
  vehicleId: string;
  stockNumber: string;
  vehicleName: string;
  vin: string;
  imageUrl: string | null;
  saleDate: string;
  totalPriceOtd: number;
  totalCollected: number;
  soldPrice: number;
  grossProfit: number;
  notes: string | null;
  dealJacketId: string | null;
  jacketNumber: string | null;
  salesRepName: string;
  balanceDue: number;
};

export type CustomerProfileSummary = {
  totalVehiclesPurchased: number;
  totalSpent: number;
  lastPurchaseDate: string | null;
  firstPurchaseDate: string | null;
  averagePurchaseAmount: number;
  dealsInProgress: number;
  openBalance: number;
};

export type CustomerVehicleItem = {
  vehicleId: string;
  stockNumber: string;
  vehicleName: string;
  vin: string;
  imageUrl: string | null;
  saleDate: string;
  soldPrice: number;
  dealId: string;
  dealJacketId: string | null;
};

export type CustomerNoteItem = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type CustomerCommunicationItem = {
  id: string;
  type: CommunicationType;
  subject: string;
  body: string;
  occurredAt: string;
  authorName: string;
};

export type CustomerDocumentItem = {
  id: string;
  label: string;
  url: string;
  source: "deal" | "customer";
  createdAt: string;
};

export type ActivityTimelineItem = {
  id: string;
  type: "communication" | "note" | "deal" | "audit";
  title: string;
  description: string;
  occurredAt: string;
  icon: "mail" | "phone" | "car" | "note" | "calendar";
};

export type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  imageUrl: string | null;
  type: CustomerType;
  status: CustomerStatus;
  source: CustomerSource | null;
  salesRepId: string | null;
  salesRepName: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string | null;
  driversLicenseNumber: string | null;
  customerSince: string;
  lifetimeValue: number;
  vehicleCount: number;
  activeDealsCount: number;
  totalDealsCount: number;
  lastActivityDate: string;
  lastActivityLabel: string;
  purchaseHistory: PurchaseHistoryItem[];
  deals: CustomerDealItem[];
  notes: CustomerNoteItem[];
  communications: CustomerCommunicationItem[];
  documents: CustomerDocumentItem[];
  activityTimeline: ActivityTimelineItem[];
  profileSummary: CustomerProfileSummary;
  vehicles: CustomerVehicleItem[];
  latestNotePreview: string | null;
  fullAddress: string;
};

const STATUS_LABELS: Record<CustomerStatus, string> = {
  lead: "Lead",
  active_deal: "Active Deal",
  customer: "Customer",
};

const SOURCE_LABELS: Record<CustomerSource, string> = {
  website: "Website",
  referral: "Referral",
  walk_in: "Walk-in",
  ads: "Ads",
  social_media: "Social Media",
  other: "Other",
};

const TYPE_LABELS: Record<CustomerType, string> = {
  individual: "Individual",
  dealer: "Dealer",
  wholesale: "Wholesale",
};

export function formatCustomerStatus(status: CustomerStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatCustomerSource(source: CustomerSource | null): string {
  if (!source) return "Unknown";
  return SOURCE_LABELS[source] ?? source;
}

export function formatCustomerType(type: CustomerType): string {
  return TYPE_LABELS[type] ?? type;
}

export function getCustomerStatusStyle(status: CustomerStatus): string {
  switch (status) {
    case "lead":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "active_deal":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "customer":
      return "bg-teal-500/15 text-teal-300 border-teal-500/25";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCommunicationTypeProfile(type: CommunicationType): string {
  const labels: Record<CommunicationType, string> = {
    email: "Email",
    call: "Phone Call",
    sms: "SMS",
    meeting: "Meeting",
    inquiry: "Inquiry",
  };
  return labels[type] ?? type;
}

export function formatDisplayDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getCustomerInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatLocation(
  city: string,
  state: string,
  zip: string,
): string {
  const parts = [city, state].filter(Boolean).join(", ");
  if (zip) return parts ? `${parts} ${zip}` : zip;
  return parts || "—";
}

export function formatDelta(
  current: number,
  previous: number,
): { text: string; color: "green" | "red" } {
  if (previous === 0 && current === 0) {
    return { text: "0% vs last month", color: "green" };
  }
  if (previous === 0) {
    return { text: "+100% vs last month", color: "green" };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(1)}% vs last month`,
    color: pct >= 0 ? "green" : "red",
  };
}

export function formatCurrencyDelta(
  current: number,
  previous: number,
): { text: string; color: "green" | "red" } {
  if (previous === 0 && current === 0) {
    return { text: "0% vs last month", color: "green" };
  }
  if (previous === 0) {
    return { text: "+100% vs last month", color: "green" };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(1)}% vs last month`,
    color: pct >= 0 ? "green" : "red",
  };
}

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "lead",
  "active_deal",
  "customer",
];

export const CUSTOMER_SOURCES: CustomerSource[] = [
  "website",
  "referral",
  "walk_in",
  "ads",
  "social_media",
  "other",
];

export const CUSTOMER_TYPES: CustomerType[] = [
  "individual",
  "dealer",
  "wholesale",
];

export const COMMUNICATION_TYPES: CommunicationType[] = [
  "email",
  "call",
  "sms",
  "meeting",
  "inquiry",
];

export function formatCommunicationType(type: CommunicationType): string {
  const labels: Record<CommunicationType, string> = {
    email: "Email",
    call: "Call",
    sms: "SMS",
    meeting: "Meeting",
    inquiry: "Inquiry",
  };
  return labels[type] ?? type;
}
