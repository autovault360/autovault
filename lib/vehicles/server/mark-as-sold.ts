"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, assertVehicleActive, uploadFile, type ActionResult } from "./utils";
import { revalidatePath } from "next/cache";

const schema = z.object({
  vehicleId: z.string().uuid(),
  customerType: z.string(),
  customerName: z.string().min(1),
  phoneNumber: z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$/),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  saleDate: z.string().min(1),
  totalPriceOtd: z.coerce.number().positive(),
  salesTaxAmount: z.coerce.number().default(0),
  licenseRegistrationFees: z.coerce.number().default(0),
  dmvDocFees: z.coerce.number().default(0),
  otherFees: z.coerce.number().default(0),
  totalCollected: z.coerce.number().positive(),
  rosNumber: z.string().optional(),
  zipCodeOfSale: z.string().optional(),
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

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", data.phoneNumber)
      .eq("dealership_id", dealershipId)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({
          name: data.customerName,
          email: data.email || null,
          address: data.address,
          address2: data.address2 || null,
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
          type: data.customerType,
          name: data.customerName,
          phone: data.phoneNumber,
          email: data.email || null,
          address: data.address,
          address2: data.address2 || null,
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

    const buyerIdFront = formData.get("buyerIdFront") as File | null;
    const buyerIdBack = formData.get("buyerIdBack") as File | null;
    const driversLicense = formData.get("driversLicense") as File | null;
    const otherDoc = formData.get("otherDocument") as File | null;

    const docBase = `${dealershipId}/${data.vehicleId}/docs`;

    let buyerIdFrontPath: string | null = null;
    let buyerIdBackPath: string | null = null;
    let driversLicensePath: string | null = null;
    let otherDocPath: string | null = null;

    if (buyerIdFront) {
      buyerIdFrontPath = `${docBase}/buyer-id-front`;
      await uploadFile("vehicle-documents", buyerIdFrontPath, buyerIdFront);
      uploadedPaths.push(buyerIdFrontPath);
    }
    if (buyerIdBack) {
      buyerIdBackPath = `${docBase}/buyer-id-back`;
      await uploadFile("vehicle-documents", buyerIdBackPath, buyerIdBack);
      uploadedPaths.push(buyerIdBackPath);
    }
    if (driversLicense) {
      driversLicensePath = `${docBase}/drivers-license`;
      await uploadFile("vehicle-documents", driversLicensePath, driversLicense);
      uploadedPaths.push(driversLicensePath);
    }
    if (otherDoc) {
      otherDocPath = `${docBase}/other`;
      await uploadFile("vehicle-documents", otherDocPath, otherDoc);
      uploadedPaths.push(otherDocPath);
    }

    const { error: dealError } = await supabase.from("deals").insert({
      vehicle_id: data.vehicleId,
      customer_id: customerId,
      dealership_id: dealershipId,
      sale_date: data.saleDate,
      total_price_otd: data.totalPriceOtd,
      sales_tax_amount: data.salesTaxAmount,
      license_fees: data.licenseRegistrationFees,
      dmv_fees: data.dmvDocFees,
      other_fees: data.otherFees,
      total_collected: data.totalCollected,
      ros_number: data.rosNumber,
      zip_of_sale: data.zipCodeOfSale,
      buyer_id_front_path: buyerIdFrontPath,
      buyer_id_back_path: buyerIdBackPath,
      drivers_license_path: driversLicensePath,
      other_doc_path: otherDocPath,
      notes: data.notes,
      created_by: userId,
    });

    if (dealError) throw new Error(dealError.message);

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
      new_values: { customer_name: data.customerName, sale_price: data.totalPriceOtd, sale_date: data.saleDate },
      changed_by: userId,
    });
    if (auditError) console.error("audit_logs insert failed:", auditError.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/customers");
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
