"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerFormSchema, type CustomerFormValues } from "../actions/schemas";
import type { CustomerSource, CustomerStatus, CustomerType } from "../types";
import { assertPhoneAvailable, authenticateUser } from "./utils";

export type CustomerActionResult =
  | { success: true; customerId: string }
  | { success: false; error: string };

function duplicatePhoneMessage(error: { message?: string }): string | null {
  if (error.message?.includes("idx_customers_phone_unique")) {
    return "A customer with this phone number already exists";
  }
  return null;
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<CustomerActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const data = customerFormSchema.parse(values);
    const supabase = await createClient();

    const phoneError = await assertPhoneAvailable(
      supabase,
      auth.user.dealershipId,
      data.phone,
    );
    if (phoneError) return { success: false, error: phoneError };

    const { data: row, error } = await supabase
      .from("customers")
      .insert({
        dealership_id: auth.user.dealershipId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        type: data.type as CustomerType,
        status: data.status as CustomerStatus,
        sales_rep_id: data.salesRepId && data.salesRepId !== "" ? data.salesRepId : null,
        source: data.source ? (data.source as CustomerSource) : null,
        address: data.address || null,
        address2: data.address2 || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        date_of_birth: data.dateOfBirth || null,
        drivers_license_number: data.driversLicenseNumber || null,
        created_by: auth.user.userId,
      })
      .select("id")
      .single();

    if (error) {
      const dup = duplicatePhoneMessage(error);
      throw new Error(dup ?? error.message);
    }

    revalidatePath("/dashboard/customers");
    return { success: true, customerId: row.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateCustomer(
  customerId: string,
  values: CustomerFormValues,
): Promise<CustomerActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const data = customerFormSchema.parse(values);
    const supabase = await createClient();

    const phoneError = await assertPhoneAvailable(
      supabase,
      auth.user.dealershipId,
      data.phone,
      customerId,
    );
    if (phoneError) return { success: false, error: phoneError };

    const { error } = await supabase
      .from("customers")
      .update({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        type: data.type as CustomerType,
        status: data.status as CustomerStatus,
        sales_rep_id: data.salesRepId && data.salesRepId !== "" ? data.salesRepId : null,
        source: data.source ? (data.source as CustomerSource) : null,
        address: data.address || null,
        address2: data.address2 || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        date_of_birth: data.dateOfBirth || null,
        drivers_license_number: data.driversLicenseNumber || null,
      })
      .eq("id", customerId)
      .eq("dealership_id", auth.user.dealershipId);

    if (error) {
      const dup = duplicatePhoneMessage(error);
      throw new Error(dup ?? error.message);
    }

    revalidatePath("/dashboard/customers");
    return { success: true, customerId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
