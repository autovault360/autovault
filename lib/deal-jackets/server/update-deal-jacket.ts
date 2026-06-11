"use server";

import { createClient } from "@/lib/supabase/server";
import { requireDealJacketAuth } from "./auth";
import {
  calculateDealJacketFinancials,
  normalizeFees,
  sumVehicleExpenses,
} from "./calculate-financials";
import { logDealJacketActivity } from "./activity";
import { uploadFile } from "@/lib/vehicles/server/utils";
import { updateCommissionStatus } from "@/lib/sales-rep/commissions/server/update-commission-status";
import type { SubmitDealJacketFormData } from "./submit-deal-jacket";

export type UpdateDealJacketResult =
  | { success: true; jacketNumber: string }
  | { success: false; error: string };

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

export async function updateDealJacket(
  dealJacketId: string,
  formData: SubmitDealJacketFormData,
  files: File[] = [],
): Promise<UpdateDealJacketResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { dealershipId, userId } = auth.user;

  const { data: existing } = await supabase
    .from("deal_jackets")
    .select("*")
    .eq("id", dealJacketId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (!existing) {
    return { success: false, error: "Deal jacket not found" };
  }

  if (existing.workflow_status !== "changes_requested") {
    return {
      success: false,
      error: "Can only edit a deal jacket that has changes requested",
    };
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, acquisition_cost, total_invested, created_by, dealership_id")
    .eq("id", formData.linkedVehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (!vehicle) {
    return { success: false, error: "Vehicle not found in your dealership" };
  }

  const phoneClean = formData.buyerPhone.replace(/\D/g, "");

  const address =
    formData.buyerAddress && formData.buyerState
      ? `${formData.buyerAddress}, ${formData.buyerState}`
      : formData.buyerAddress ?? null;

  await supabase
    .from("customers")
    .update({
      name: formData.buyerName,
      phone: phoneClean,
      email: formData.buyerEmail,
      address,
      state: formData.buyerState,
      drivers_license_number: formData.driverLicenseNo,
    })
    .eq("id", existing.customer_id);

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

  const { data: expenseRows } = await supabase
    .from("vehicle_expenses")
    .select("id, total_cost")
    .eq("vehicle_id", formData.linkedVehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  const expensesTotal = sumVehicleExpenses(expenseRows ?? []);

  const { data: repProfile } = await supabase
    .from("sales_rep_profiles")
    .select("commission_rate")
    .eq("user_id", existing.sales_rep_id ?? "")
    .maybeSingle();
  const commissionRate =
    repProfile?.commission_rate != null && Number(repProfile.commission_rate) >= 0
      ? Number(repProfile.commission_rate)
      : 0.1;

  const financials = calculateDealJacketFinancials({
    soldPrice: formData.salePrice,
    vehicleInvested: Number(vehicle.acquisition_cost ?? 0),
    vehicleExpensesTotal: expensesTotal,
    additionalExpenses: formData.warrantyAmount || 0 + (formData.gapAmount || 0),
    commissionRate,
  });

  const dateSold = formData.saleDate.includes("T")
    ? formData.saleDate
    : `${formData.saleDate}T12:00:00Z`;

  const fees = normalizeFees({
    dmv: formData.dmvFees || 0,
    registration: formData.registrationFees || 0,
    documentation: formData.documentationFees || 0,
  });

  const uploadedDocs = await uploadDocuments(files);

  const { error: updateError } = await supabase
    .from("deal_jackets")
    .update({
      sold_price: formData.salePrice,
      total_tax: totalTax,
      fees,
      total_sale_price: totalSalePrice,
      down_payment: formData.downPayment || 0,
      amount_financed: amountFinanced,
      balance_due: amountFinanced,
      additional_expenses: formData.warrantyAmount || 0 + (formData.gapAmount || 0),
      total_invested: financials.totalInvested,
      commission_amount: financials.commissionAmount,
      profit_gross: financials.profitGross,
      profit_net: financials.profitNet,
      date_sold: dateSold,
      trade_in_allowance: formData.tradeInAllowance || 0,
      warranty_amount: formData.warrantyAmount || 0,
      gap_amount: formData.gapAmount || 0,
      lender: formData.lender || null,
      ros_number: formData.rosNumber || null,
      deal_type: formData.dealType,
      notes: formData.notes || null,
      workflow_status: "resubmitted",
      review_notes: null,
      change_categories: null,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealJacketId);

  if (updateError) {
    console.error("Failed to update deal jacket:", updateError.message);
    return { success: false, error: "Failed to update deal jacket. Please try again." };
  }

  if (uploadedDocs.length > 0) {
    const docRows = uploadedDocs.map((d) => ({
      dealership_id: dealershipId,
      deal_jacket_id: dealJacketId,
      file_url: d.path,
      file_type: d.type,
      document_name: d.name,
      created_by: userId,
    }));

    await supabase.from("deal_jacket_documents").insert(docRows);
  }

  await logDealJacketActivity({
    dealJacketId,
    action: "resubmitted",
    actorId: userId,
    actorName: userId,
    oldStatus: "changes_requested",
    newStatus: "resubmitted",
    detail: {
      dealType: formData.dealType,
      salePrice: formData.salePrice,
      edited: true,
    },
  });

  await updateCommissionStatus(dealJacketId, "resubmitted", {
    commission_amount: financials.commissionAmount,
    commission_rate: commissionRate,
    gross_profit: financials.profitGross,
    sold_price: formData.salePrice,
  });

  return {
    success: true,
    jacketNumber: existing.jacket_number,
  };
}
