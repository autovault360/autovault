"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { salesRepFormSchema, type SalesRepFormValues } from "../actions/schemas";
import {
  assertCanManageSalesReps,
  assertEmailAvailable,
  findAuthUserByEmail,
} from "./utils";

export type SalesRepActionResult =
  | { success: true; userId: string }
  | { success: false; error: string };

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 24; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("column")
  );
}

export async function createSalesRep(
  values: SalesRepFormValues,
): Promise<SalesRepActionResult> {
  try {
    const auth = await assertCanManageSalesReps();
    if (!auth.ok) return { success: false, error: auth.error };

    const data = salesRepFormSchema.parse(values);
    const service = createServiceClient();

    const emailError = await assertEmailAvailable(
      data.email,
      auth.user.dealershipId,
    );
    if (emailError) return { success: false, error: emailError };

    const existingAuth = await findAuthUserByEmail(data.email);
    if (existingAuth) {
      const { data: linkedProfile } = await service
        .from("users")
        .select("id, dealership_id")
        .eq("auth_user_id", existingAuth.id)
        .maybeSingle();

      if (linkedProfile) {
        return {
          success: false,
          error: "An account with this email already exists",
        };
      }
    }

    let authUserId = existingAuth?.id;

    if (!authUserId) {
      const { data: authUser, error: authError } =
        await service.auth.admin.createUser({
          email: data.email.trim(),
          password: generateTempPassword(),
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName,
            role: data.role,
          },
        });

      if (authError || !authUser.user) {
        throw new Error(authError?.message ?? "Failed to create login account");
      }
      authUserId = authUser.user.id;
    }

    const basePayload = {
      auth_user_id: authUserId,
      dealership_id: auth.user.dealershipId,
      email: data.email.trim(),
      full_name: data.fullName,
      role: data.role,
      is_active: data.isActive,
    };

    const extendedPayload = {
      ...basePayload,
      phone: data.phone,
      address: data.address || null,
      address2: data.address2 || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      hire_date: data.hireDate || null,
      commission_rate: data.commissionRate / 100,
      monthly_goal: data.monthlyGoal,
    };

    let insertResult = await service
      .from("users")
      .insert(extendedPayload)
      .select("id")
      .single();

    if (insertResult.error && isMissingColumnError(insertResult.error.message)) {
      insertResult = await service
        .from("users")
        .insert(basePayload)
        .select("id")
        .single();
    }

    if (insertResult.error || !insertResult.data) {
      if (!existingAuth && authUserId) {
        await service.auth.admin.deleteUser(authUserId);
      }
      throw new Error(insertResult.error?.message ?? "Failed to create sales rep");
    }

    revalidatePath("/dashboard/sales-reps");
    revalidatePath("/dashboard/customers");
    return { success: true, userId: insertResult.data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
