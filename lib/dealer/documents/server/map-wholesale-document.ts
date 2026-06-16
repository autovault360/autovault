import type { WholesaleDocument, WholesaleDocumentVehicle } from "../types";

export type WholesaleDocumentDbRow = {
  id: string;
  dealership_id: string;
  wholesale_dealer_id: string;
  vehicle_id: string | null;
  document_name: string;
  document_type: string;
  category: string;
  description: string | null;
  original_file_name: string;
  stored_file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  upload_date: string;
  expiry_date: string | null;
  status: string;
  remarks: string | null;
  uploaded_by: string;
  file_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vehicle?: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    stock_number: string | null;
    vin: string;
  } | null;
  uploader?: { full_name: string | null } | null;
};

export function mapWholesaleDocument(
  row: WholesaleDocumentDbRow,
  vehicleImageUrl?: string | null,
): WholesaleDocument {
  let vehicle: WholesaleDocumentVehicle | null = null;
  if (row.vehicle) {
    vehicle = {
      id: row.vehicle.id,
      year: row.vehicle.year,
      make: row.vehicle.make,
      model: row.vehicle.model,
      trim: row.vehicle.trim ?? undefined,
      stockNumber: row.vehicle.stock_number ?? "",
      vin: row.vehicle.vin,
      imageUrl: vehicleImageUrl ?? undefined,
    };
  }

  return {
    id: row.id,
    dealershipId: row.dealership_id,
    wholesaleDealerId: row.wholesale_dealer_id,
    vehicleId: row.vehicle_id,
    vehicle,
    documentName: row.document_name,
    documentType: row.document_type as WholesaleDocument["documentType"],
    category: row.category as WholesaleDocument["category"],
    description: row.description,
    originalFileName: row.original_file_name,
    storedFileName: row.stored_file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size ?? 0),
    uploadDate: row.upload_date,
    expiryDate: row.expiry_date,
    status: row.status as WholesaleDocument["status"],
    remarks: row.remarks,
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploader?.full_name ?? "Unknown",
    fileId: row.file_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysIsoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
