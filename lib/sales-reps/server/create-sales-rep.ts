"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { salesRepFormSchema, type SalesRepFormValues } from "../actions/schemas";
import {
  assertCanManageSalesReps,
  assertEmailAvailable,
  findAuthUserByEmail,
} from "./utils";
import { sendTransactionalEmail } from "@/services/brevo.service";
import { salesRepWelcomeEmail } from "@/lib/email/email-template";

export type SalesRepActionResult =
  | { success: true; userId: string }
  | { success: false; error: string };

function generateTempPassword(): string {
  const prefix = "AV";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let suffix = "";
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 18; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  const shuffled = suffix
    .split("")
    .sort(() => (crypto.getRandomValues(new Uint8Array(1))[0] > 127 ? 1 : -1))
    .join("");
  return prefix + "@" + shuffled;
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
    const password = generateTempPassword();

    if (!authUserId) {
      const { data: authUser, error: authError } =
        await service.auth.admin.createUser({
          email: data.email.trim(),
          password,
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
    } else {
      await service.auth.admin.updateUserById(authUserId, { password });
    }

    const insertPayload = {
      auth_user_id: authUserId,
      dealership_id: auth.user.dealershipId,
      email: data.email.trim(),
      full_name: data.fullName,
      role: data.role,
      is_active: data.isActive,
      phone: data.phone,
    };

    const { data: insertResult, error: insertError } = await service
      .from("users")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !insertResult) {
      if (!existingAuth && authUserId) {
        await service.auth.admin.deleteUser(authUserId);
      }
      throw new Error(insertError?.message ?? "Failed to create sales rep");
    }

    const userId = insertResult.id;

    if (data.role === "sales_rep" || data.role === "manager") {
      const { error: profileError } = await service.from("sales_rep_profiles").upsert(
        {
          user_id: userId,
          address: data.address || null,
          address2: data.address2 || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
          hire_date: data.hireDate || null,
          commission_rate: data.commissionRate / 100,
          monthly_goal: data.monthlyGoal,
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        console.error("Failed to create sales_rep_profile:", profileError.message);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const emailResult = await sendTransactionalEmail({
      to: [{ email: data.email, name: data.fullName }],
      subject: `Welcome to AutoVault360 �€” Your Account Has Been Created`,
      htmlContent: salesRepWelcomeEmail({
        fullName: data.fullName,
        email: data.email,
        tempPassword: password,
        role: data.role,
        userId,
        authUserId,
        dealershipId: auth.user.dealershipId,
        loginUrl: `${appUrl}/sales-rep/login`,
      }),
    });

    if (!emailResult.success) {
      console.error("Welcome email failed to send:", emailResult.error);
    }

    revalidatePath("/dashboard/sales-reps");
    revalidatePath("/dashboard/customers");
    return { success: true, userId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
