"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { assertCanManageSalesReps } from "./utils";

export async function impersonateSalesRep(
  salesRepId: string,
): Promise<{ email?: string; token?: string; error?: string }> {
  try {
    const auth = await assertCanManageSalesReps();
    if (!auth.ok) return { error: auth.error };

    const service = createServiceClient();

    const { data: user } = await service
      .from("users")
      .select("id, auth_user_id, email, full_name, role")
      .eq("id", salesRepId)
      .eq("dealership_id", auth.user.dealershipId)
      .maybeSingle();

    if (!user) return { error: "Sales rep not found" };

    if (!["sales_rep", "manager"].includes(user.role)) {
      return { error: "Can only log in as a sales rep or manager" };
    }

    const { data, error } = await service.auth.admin.generateLink({
      type: "recovery",
      email: user.email,
    });

    if (error) return { error: error.message };

    const token = data?.properties?.email_otp;
    if (typeof token !== "string") return { error: "Failed to generate login token" };

    return { email: user.email, token };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}
