"use server";

import { createClient } from "@/lib/supabase/server";
import { requireDealJacketAuth } from "./auth";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { formatPhoneNumber } from "@/lib/vehicles/actions/utils";

export type DealJacketEditData = {
  jacketId: string;
  jacketNumber: string;
  linkedVehicleId: string;
  stockNo: string;
  vin: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
  driverLicenseNo: string;
  buyerState: string;
  salePrice: number;
  saleDate: string;
  downPayment: number;
  tradeInAllowance: number;
  dmvFees: number;
  registrationFees: number;
  documentationFees: number;
  warrantyAmount: number;
  gapAmount: number;
  lender: string;
  rosNumber: string;
  dealType: string;
  notes: string;
  vehicleImageUrl: string | null;
  vehicleDisplayName: string;
  vehicleStatus: string;
  vehicleMileage: number;
  vehicleAcquisitionCost: number;
  customerId: string;
  existingDocuments: Array<{
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  }>;
};

export async function getDealJacketEditData(
  dealJacketId: string,
): Promise<{ success: true; data: DealJacketEditData } | { success: false; error: string }> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const { data: row, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      *,
      vehicle:vehicles(
        id, year, make, model, trim, stock_number, vin, mileage,
        exterior_color, acquisition_cost, status,
        images:vehicle_images(storage_path, is_primary)
      ),
      customer:customers(id, name, phone, email, address, drivers_license_number, city, state, zip)
    `,
    )
    .eq("id", dealJacketId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (error || !row) {
    return { success: false, error: "Deal jacket not found" };
  }

  const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
  const customer = Array.isArray(row.customer)
    ? row.customer[0]
    : row.customer;

  const images = vehicle?.images ?? [];
  const primary =
    images.find((i: { is_primary: boolean }) => i.is_primary) ?? images[0];
  let imageUrl: string | null = null;
  if (primary?.storage_path) {
    try {
      imageUrl = await getSignedUrl("vehicle-images", primary.storage_path, 3600);
    } catch {
      imageUrl = null;
    }
  }

  const { data: docRows } = await supabase
    .from("deal_jacket_documents")
    .select("id, document_name, file_type, file_url, uploaded_at")
    .eq("deal_jacket_id", dealJacketId)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  const documents = await Promise.all(
    (docRows ?? []).map(async (doc) => ({
      id: doc.id,
      name: doc.document_name,
      fileType: doc.file_type,
      fileUrl: doc.file_url,
      uploadedAt: doc.uploaded_at,
    })),
  );

  const fees = (row.fees ?? {}) as Record<string, number>;

  return {
    success: true,
    data: {
      jacketId: row.id,
      jacketNumber: row.jacket_number,
      linkedVehicleId: row.vehicle_id,
      stockNo: vehicle?.stock_number ?? "",
      vin: vehicle?.vin ?? "",
      buyerName: customer?.name ?? "",
      buyerPhone: formatPhoneNumber(customer?.phone ?? ""),
      buyerEmail: customer?.email ?? "",
      buyerAddress: customer?.address?.split(",")[0]?.trim() ?? "",
      driverLicenseNo: customer?.drivers_license_number ?? "",
      buyerState: customer?.state ?? "",
      salePrice: Number(row.sold_price ?? 0),
      saleDate: row.date_sold?.split("T")[0] ?? "",
      downPayment: Number(row.down_payment ?? 0),
      tradeInAllowance: Number(row.trade_in_allowance ?? 0),
      dmvFees: Number(fees.dmv ?? 0),
      registrationFees: Number(fees.registration ?? 0),
      documentationFees: Number(fees.documentation ?? 0),
      warrantyAmount: Number(row.warranty_amount ?? 0),
      gapAmount: Number(row.gap_amount ?? 0),
      lender: row.lender ?? "",
      rosNumber: row.ros_number ?? "",
      dealType: row.deal_type ?? "Retail",
      notes: row.notes ?? "",
      vehicleImageUrl: imageUrl,
      vehicleDisplayName: vehicle
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
        : "",
      vehicleStatus: vehicle?.status ?? "",
      vehicleMileage: vehicle?.mileage ?? 0,
      vehicleAcquisitionCost: Number(vehicle?.acquisition_cost ?? 0),
      customerId: customer?.id ?? row.customer_id,
      existingDocuments: documents.map((d) => ({
        id: d.id,
        name: d.name,
        fileUrl: d.fileUrl,
        fileType: d.fileType,
        uploadedAt: d.uploadedAt,
      })),
    },
  };
}
