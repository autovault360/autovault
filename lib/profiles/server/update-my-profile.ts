"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import {
  cpaProfileUpdateSchema,
  salesRepProfileUpdateSchema,
  wholesaleDealerProfileUpdateSchema,
  type CpaProfileUpdateValues,
  type SalesRepProfileUpdateValues,
  type WholesaleDealerProfileUpdateValues,
} from "../actions/schemas";
import { authenticateForProfile } from "./auth";

export type ProfileUpdateResult =
  | { success: true }
  | { success: false; error: string };

function revalidateProfilePaths(role: string) {
  switch (role) {
    case "sales_rep":
      revalidatePath("/sales-rep", "layout");
      revalidatePath("/sales-rep/profile");
      break;
    case "wholesale_dealer":
      revalidatePath("/dealer", "layout");
      revalidatePath("/dealer/profile");
      break;
    case "cpa":
      revalidatePath("/cpa", "layout");
      revalidatePath("/cpa/profile");
      break;
  }
}

export async function updateSalesRepProfile(
  values: SalesRepProfileUpdateValues,
): Promise<ProfileUpdateResult> {
  try {
    const auth = await authenticateForProfile();
    if (!auth.ok) return { success: false, error: auth.error };
    if (auth.role !== "sales_rep") {
      return { success: false, error: "Invalid role for this profile update" };
    }

    const data = salesRepProfileUpdateSchema.parse(values);
    const service = createServiceClient();

    const { error: userError } = await service
      .from("users")
      .update({
        full_name: data.fullName.trim(),
        phone: data.phone,
      })
      .eq("id", auth.userId);

    if (userError) throw new Error(userError.message);

    const profilePayload = {
      user_id: auth.userId,
      address: data.address?.trim() || null,
      address2: data.address2?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      zip: data.zip?.trim() || null,
    };

    const { data: existing } = await service
      .from("sales_rep_profiles")
      .select("id")
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (existing) {
      const { error } = await service
        .from("sales_rep_profiles")
        .update(profilePayload)
        .eq("user_id", auth.userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await service
        .from("sales_rep_profiles")
        .insert(profilePayload);
      if (error) throw new Error(error.message);
    }

    revalidateProfilePaths(auth.role);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function updateWholesaleDealerProfile(
  values: WholesaleDealerProfileUpdateValues,
): Promise<ProfileUpdateResult> {
  try {
    const auth = await authenticateForProfile();
    if (!auth.ok) return { success: false, error: auth.error };
    if (auth.role !== "wholesale_dealer") {
      return { success: false, error: "Invalid role for this profile update" };
    }

    const data = wholesaleDealerProfileUpdateSchema.parse(values);
    const service = createServiceClient();

    const { error: userError } = await service
      .from("users")
      .update({
        full_name: data.contactPerson.trim(),
        phone: data.businessPhone,
      })
      .eq("id", auth.userId);

    if (userError) throw new Error(userError.message);

    const profilePayload = {
      user_id: auth.userId,
      company_name: data.companyName.trim(),
      business_phone: data.businessPhone,
      contact_person: data.contactPerson.trim(),
      tax_id: data.taxId?.trim() || null,
      license_number: data.licenseNumber?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      zip: data.zip?.trim() || null,
    };

    const { data: existing } = await service
      .from("wholesale_dealer_profiles")
      .select("id")
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (existing) {
      const { error } = await service
        .from("wholesale_dealer_profiles")
        .update(profilePayload)
        .eq("user_id", auth.userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await service
        .from("wholesale_dealer_profiles")
        .insert(profilePayload);
      if (error) throw new Error(error.message);
    }

    revalidateProfilePaths(auth.role);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function updateCpaProfile(
  values: CpaProfileUpdateValues,
): Promise<ProfileUpdateResult> {
  try {
    const auth = await authenticateForProfile();
    if (!auth.ok) return { success: false, error: auth.error };
    if (auth.role !== "cpa") {
      return { success: false, error: "Invalid role for this profile update" };
    }

    const data = cpaProfileUpdateSchema.parse(values);
    const service = createServiceClient();
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const { error: userError } = await service
      .from("users")
      .update({
        full_name: fullName,
        phone: data.phone?.trim() || null,
      })
      .eq("id", auth.userId);

    if (userError) throw new Error(userError.message);

    const profilePayload = {
      user_id: auth.userId,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
    };

    const { data: existing } = await service
      .from("cpa_profiles")
      .select("id")
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (existing) {
      const { error } = await service
        .from("cpa_profiles")
        .update(profilePayload)
        .eq("user_id", auth.userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await service
        .from("cpa_profiles")
        .insert({ ...profilePayload, status: "ACTIVE" });
      if (error) throw new Error(error.message);
    }

    revalidateProfilePaths(auth.role);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: message };
  }
}
