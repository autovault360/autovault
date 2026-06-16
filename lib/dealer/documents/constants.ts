export const WHOLESALE_DOCUMENT_TYPES = [
  "vehicle_document",
  "dealer_document",
  "general",
] as const;

export type WholesaleDocumentType = (typeof WHOLESALE_DOCUMENT_TYPES)[number];

export const WHOLESALE_DOCUMENT_TYPE_LABELS: Record<WholesaleDocumentType, string> = {
  vehicle_document: "Vehicle Document",
  dealer_document: "Dealer Document",
  general: "General Document",
};

export const WHOLESALE_DOCUMENT_CATEGORIES = [
  "bill_of_sale",
  "title",
  "purchase_invoice",
  "repair_receipt",
  "auction_invoice",
  "registration",
  "insurance",
  "other",
] as const;

export type WholesaleDocumentCategory = (typeof WHOLESALE_DOCUMENT_CATEGORIES)[number];

export const WHOLESALE_DOCUMENT_CATEGORY_LABELS: Record<WholesaleDocumentCategory, string> = {
  bill_of_sale: "Bill of Sale",
  title: "Title",
  purchase_invoice: "Purchase Invoice",
  repair_receipt: "Repair Receipt",
  auction_invoice: "Auction Invoice",
  registration: "Registration",
  insurance: "Insurance",
  other: "Other",
};

export const WHOLESALE_DOCUMENT_CATEGORY_COLORS: Record<WholesaleDocumentCategory, string> = {
  bill_of_sale: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  title: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  purchase_invoice: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  repair_receipt: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  auction_invoice: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  registration: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  insurance: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  other: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export const WHOLESALE_DOCUMENT_STATUSES = [
  "active",
  "pending_review",
  "expired",
  "archived",
] as const;

export type WholesaleDocumentStatus = (typeof WHOLESALE_DOCUMENT_STATUSES)[number];

export const WHOLESALE_DOCUMENT_STATUS_LABELS: Record<WholesaleDocumentStatus, string> = {
  active: "Active",
  pending_review: "Pending Review",
  expired: "Expired",
  archived: "Archived",
};

export const WHOLESALE_DOCUMENT_STATUS_COLORS: Record<WholesaleDocumentStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  pending_review: "bg-purple-500/15 text-purple-400",
  expired: "bg-red-500/15 text-red-400",
  archived: "bg-slate-500/15 text-slate-400",
};

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".docx",
  ".xlsx",
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const WHOLESALE_DOCUMENT_BUCKET = "vehicle-documents" as const;

export function buildWholesaleDocumentStoragePath(
  dealershipId: string,
  documentId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${dealershipId}/wholesale_dealer/documents/${documentId}/${Date.now()}-${safeName}`;
}
