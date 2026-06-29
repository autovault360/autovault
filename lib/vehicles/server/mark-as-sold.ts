"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { phoneRegex, zipRegex } from "@/lib/shared/phone";
import { authenticateUser, assertVehicleActive, uploadFile, trackFile, type ActionResult } from "./utils";
import { createDealJacket } from "@/services/deal-jacket.service";
import type { DealJacketDocumentInput } from "@/lib/deal-jackets/server/db-types";
import { revalidatePath } from "next/cache";

const payoutItemSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["one_time", "weekly", "monthly", "per_deal"]),
});

const schema = z.object({
  vehicleId: z.string().uuid(),
  customerName: z.string().min(1),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number: (XXX) XXX-XXXX"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().regex(zipRegex, "Enter a valid ZIP code"),
  saleDate: z.string().min(1),
  soldPriceBeforeTax: z.coerce.number().positive(),
  salesTaxAmount: z.coerce.number().default(0),
  licenseRegistrationFees: z.coerce.number().default(0),
  totalPriceWithTaxAndFees: z.coerce.number().positive(),
  rosNumber: z.string().optional(),
  zipCodeOfSale: z.string().optional(),
  salesRepId: z.string().uuid().nullable().optional(),
  commissionType: z.enum(["percentage", "manual"]),
  commissionRate: z.coerce.number().default(0),
  manualCommissionAmount: z.coerce.number().default(0),
  commissionAmount: z.coerce.number().default(0),
  dealerPayoutsEnabled: z.boolean().default(false),
  payoutItems: z.array(payoutItemSchema).default([]),
  otherPayoutsTotal: z.coerce.number().default(0),
  netProfit: z.coerce.number().default(0),
  roiPercent: z.coerce.number().default(0),
  totalInvestment: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export async function markAsSold(formData: FormData): Promise<ActionResult> {
  const uploadedPaths: string[] = [];

  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };
    const { userId, dealershipId, role } = auth.user;

    if (!["super_admin", "owner", "manager"].includes(role)) {
      return { success: false, error: "Only managers can mark vehicles as sold" };
    }

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const supabase = await createClient();

    const activeError = await assertVehicleActive(supabase, data.vehicleId, dealershipId);
    if (activeError) return { success: false, error: activeError };

    const { data: existingCustomers } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", data.phoneNumber)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const existingCustomer = existingCustomers?.[0] ?? null;

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({
          name: data.customerName,
          email: data.email || null,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          status: "customer",
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          dealership_id: dealershipId,
          type: "individual",
          name: data.customerName,
          phone: data.phoneNumber,
          email: data.email || null,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          status: "customer",
          created_by: userId,
        })
        .select("id")
        .single();

      if (customerError) throw new Error(customerError.message);
      customerId = newCustomer.id;
    }

    const docBase = `${dealershipId}/${data.vehicleId}/docs`;
    const documentFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("document_") && value instanceof File) {
        documentFiles.push(value);
      }
    }

    if (documentFiles.length === 0) {
      return { success: false, error: "At least one document is required" };
    }

    const docPaths: { path: string; name: string }[] = [];
    const docLabels = [
      "Buyer ID (Front)",
      "Buyer ID (Back)",
      "Driver's License",
      "Bill of Sale",
      "Proof of Insurance",
      "Other Document",
    ];

    for (let i = 0; i < documentFiles.length; i++) {
      const file = documentFiles[i];
      const slug = `sale-doc-${i + 1}`;
      const path = `${docBase}/${slug}`;
      await uploadFile("vehicle-documents", path, file);
      uploadedPaths.push(path);
      await trackFile(file, "vehicle-documents", path, dealershipId, userId, {
        sourceEntity: "deal",
        sourceEntityId: data.vehicleId,
      });
      docPaths.push({
        path,
        name: docLabels[i] ?? `Document ${i + 1}`,
      });
    }

    const buyerIdFrontPath = docPaths[0]?.path ?? null;
    const buyerIdBackPath = docPaths[1]?.path ?? null;
    const driversLicensePath = docPaths[2]?.path ?? null;
    const otherDocPath = docPaths[3]?.path ?? null;

    const { data: dealRow, error: dealError } = await supabase
      .from("deals")
      .insert({
        vehicle_id: data.vehicleId,
        customer_id: customerId,
        dealership_id: dealershipId,
        sale_date: data.saleDate,
        sold_price_before_tax: data.soldPriceBeforeTax,
        total_price_otd: data.totalPriceWithTaxAndFees,
        sales_tax_amount: data.salesTaxAmount,
        license_fees: data.licenseRegistrationFees,
        dmv_fees: 0,
        other_fees: 0,
        total_collected: data.totalPriceWithTaxAndFees,
        ros_number: data.rosNumber,
        zip_of_sale: data.zipCodeOfSale,
        sales_rep_id: data.salesRepId ?? null,
        commission_type: data.commissionType,
        commission_rate: data.commissionRate,
        manual_commission_amount: data.manualCommissionAmount,
        commission_amount: data.commissionAmount,
        dealer_payouts_enabled: data.dealerPayoutsEnabled,
        other_payouts_total: data.otherPayoutsTotal,
        net_profit: data.netProfit,
        roi_percent: data.roiPercent,
        buyer_id_front_path: buyerIdFrontPath,
        buyer_id_back_path: buyerIdBackPath,
        drivers_license_path: driversLicensePath,
        other_doc_path: otherDocPath,
        notes: data.notes,
        created_by: userId,
      })
      .select("id")
      .single();

    if (dealError || !dealRow) throw new Error(dealError?.message ?? "Failed to create deal");

    if (data.dealerPayoutsEnabled && data.payoutItems.length > 0) {
      const payoutRows = data.payoutItems.map((item) => ({
        deal_id: dealRow.id,
        dealership_id: dealershipId,
        description: item.description,
        amount: item.amount,
        frequency: item.frequency,
      }));
      const { error: payoutError } = await supabase
        .from("deal_rep_payout_items")
        .insert(payoutRows);
      if (payoutError) throw new Error(payoutError.message);
    }

    const jacketDocuments: DealJacketDocumentInput[] = docPaths.map((doc) => ({
      storagePath: doc.path,
      fileType: "image",
      documentName: doc.name,
    }));

    const jacketResult = await createDealJacket({
      dealershipId,
      createdBy: userId,
      markVehiclePendingDeal: false,
      sale: {
        dealId: dealRow.id,
        vehicleId: data.vehicleId,
        customerId,
        salesRepId: data.salesRepId ?? null,
        saleDate: data.saleDate,
        soldPrice: data.soldPriceBeforeTax,
        totalTax: data.salesTaxAmount,
        fees: {
          license: data.licenseRegistrationFees,
          registration: 0,
          dmv: 0,
          documentation: 0,
          other: 0,
        },
        totalSalePrice: data.totalPriceWithTaxAndFees,
        downPayment: data.totalPriceWithTaxAndFees,
        balanceDue: 0,
        additionalExpenses: data.otherPayoutsTotal,
        commissionAmount: data.commissionAmount,
        commissionRate: data.commissionRate / 100,
        rosNumber: data.rosNumber,
      },
      documents: jacketDocuments,
    });

    if (!jacketResult.success) {
      throw new Error(jacketResult.error);
    }

    await supabase
      .from("vehicles")
      .update({ status: "sold" })
      .eq("id", data.vehicleId);

    await supabase.from("status_history").insert({
      vehicle_id: data.vehicleId,
      dealership_id: dealershipId,
      from_status: "in_stock",
      to_status: "sold",
      notes: `Sold to ${data.customerName}`,
      changed_by: userId,
    });

    const { error: auditError } = await supabase.from("audit_logs").insert({
      dealership_id: dealershipId,
      entity_type: "vehicles",
      entity_id: data.vehicleId,
      action: "MARKED_SOLD",
      new_values: {
        customer_name: data.customerName,
        sale_price: data.soldPriceBeforeTax,
        sale_date: data.saleDate,
        net_profit: data.netProfit,
      },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/deal-jackets");
    return { success: true };
  } catch (err) {
    if (uploadedPaths.length > 0) {
      const supabase = await createClient();
      await supabase.storage.from("vehicle-documents").remove(uploadedPaths);
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
