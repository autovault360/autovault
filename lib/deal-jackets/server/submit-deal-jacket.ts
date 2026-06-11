"use server";

import { createClient } from "@/lib/supabase/server";
import { requireDealJacketAuth } from "./auth";
import { checkVehicleHasDealJacket } from "./check-deal-jacket";
import { createDealJacket } from "./create-deal-jacket";
import { logDealJacketActivity } from "./activity";
import { uploadFile } from "@/lib/vehicles/server/utils";
import { isVehicleAvailableForDeal } from "@/lib/vehicles/map-db-status";
import type { CreateDealJacketSaleData } from "./db-types";

export type SubmitDealJacketFormData = {
  linkedVehicleId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress?: string;
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
  lender?: string;
  rosNumber?: string;
  dealType: string;
  notes?: string;
};

export type SubmitDealJacketResult =
  | { success: true; jacketId: string; jacketNumber: string }
  | { success: false; error: string };

async function resolveOrCreateCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
  createdBy: string,
  data: SubmitDealJacketFormData,
): Promise<string | null> {
  const phoneClean = data.buyerPhone.replace(/\D/g, "");
  const address =
    data.buyerAddress && data.buyerState
      ? `${data.buyerAddress}, ${data.buyerState}`
      : data.buyerAddress ?? null;

  const customerPayload = {
    name: data.buyerName,
    phone: phoneClean,
    email: data.buyerEmail,
    address,
    state: data.buyerState || null,
    drivers_license_number: data.driverLicenseNo,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("dealership_id", dealershipId)
    .or(`phone.eq.${phoneClean},email.eq.${data.buyerEmail}`)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("customers")
      .update(customerPayload)
      .eq("id", existing.id);

    if (updateError) {
      console.error("Failed to update customer:", updateError.message);
      return null;
    }

    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("customers")
    .insert({
      dealership_id: dealershipId,
      created_by: createdBy,
      ...customerPayload,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to create customer:", error?.message);
    return null;
  }

  return inserted.id;
}

async function uploadDocuments(
  files: File[],
): Promise<{ path: string; name: string; type: string }[]> {
  const uploaded: { path: string; name: string; type: string }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "pdf";
    const storagePath = `deal-jackets/${crypto.randomUUID()}.${ext}`;
    try {
      await uploadFile("deal-jacket-documents", storagePath, file);
      uploaded.push({
        path: storagePath,
        name: file.name,
        type: file.type || "application/octet-stream",
      });
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
    }
  }

  return uploaded;
}

export async function submitDealJacket(
  formData: SubmitDealJacketFormData,
  files: File[] = [],
): Promise<SubmitDealJacketResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { dealershipId, userId } = auth.user;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, status, acquisition_cost, total_invested, created_by, dealership_id")
    .eq("id", formData.linkedVehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (!vehicle) {
    return { success: false, error: "Vehicle not found in your dealership" };
  }

  const vehicleStatus = vehicle.status as string;
  if (vehicleStatus === "pending_deal") {
    return {
      success: false,
      error: "This vehicle already has a deal in progress",
    };
  }
  if (vehicleStatus === "sold" || vehicleStatus === "loss") {
    return { success: false, error: "Vehicle is already marked as sold" };
  }
  if (!isVehicleAvailableForDeal(vehicleStatus)) {
    return { success: false, error: "Vehicle is not available for a deal jacket" };
  }

  const jacketCheck = await checkVehicleHasDealJacket(formData.linkedVehicleId);
  if (jacketCheck.hasJacket) {
    return {
      success: false,
      error: "A deal jacket already exists for this vehicle",
    };
  }

  const customerId = await resolveOrCreateCustomer(supabase, dealershipId, userId, formData);
  if (!customerId) {
    return { success: false, error: "Failed to create or find customer" };
  }

  const totalTax = formData.salePrice * 0.1025;
  const totalFeesExtras =
    (formData.dmvFees || 0) +
    (formData.registrationFees || 0) +
    (formData.documentationFees || 0);
  const totalSalePrice =
    formData.salePrice +
    totalTax +
    totalFeesExtras +
    (formData.warrantyAmount || 0) +
    (formData.gapAmount || 0);
  const amountFinanced = Math.max(
    0,
    totalSalePrice -
      (formData.downPayment || 0) -
      (formData.tradeInAllowance || 0),
  );

  const saleData: CreateDealJacketSaleData = {
    vehicleId: formData.linkedVehicleId,
    customerId,
    salesRepId: userId,
    saleDate: formData.saleDate,
    soldPrice: formData.salePrice,
    totalTax,
    fees: {
      dmv: formData.dmvFees || 0,
      registration: formData.registrationFees || 0,
      documentation: formData.documentationFees || 0,
    },
    totalSalePrice,
    downPayment: formData.downPayment || 0,
    amountFinanced,
    balanceDue: amountFinanced,
    additionalExpenses: formData.warrantyAmount || 0 + (formData.gapAmount || 0),
    notes: formData.notes || null,
  };

  const uploadedDocs = await uploadDocuments(files);

  const result = await createDealJacket({
    dealershipId,
    createdBy: userId,
    sale: saleData,
    documents: uploadedDocs.map((d) => ({
      storagePath: d.path,
      fileType: d.type,
      documentName: d.name,
    })),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await supabase
    .from("deal_jackets")
    .update({
      trade_in_allowance: formData.tradeInAllowance || 0,
      warranty_amount: formData.warrantyAmount || 0,
      gap_amount: formData.gapAmount || 0,
      lender: formData.lender || null,
      ros_number: formData.rosNumber || null,
      deal_type: formData.dealType,
      notes: formData.notes || null,
    })
    .eq("id", result.dealJacket.id);

  await logDealJacketActivity({
    dealJacketId: result.dealJacket.id,
    action: "submitted",
    actorId: userId,
    actorName: userId,
    oldStatus: "pending_review",
    newStatus: "pending_review",
    detail: {
      dealType: formData.dealType,
      salePrice: formData.salePrice,
    },
  });

  return {
    success: true,
    jacketId: result.dealJacket.id,
    jacketNumber: result.dealJacket.jacket_number,
  };
}
