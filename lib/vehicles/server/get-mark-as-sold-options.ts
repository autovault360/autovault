"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "./utils";

export type MarkAsSoldSalesRepOption = {
  id: string;
  fullName: string;
  commissionRate: number;
};

export async function getMarkAsSoldOptions(): Promise<{
  salesReps: MarkAsSoldSalesRepOption[];
}> {
  const auth = await authenticateUser();
  if (!auth.ok) return { salesReps: [] };

  const supabase = await createClient();
  const { dealershipId } = auth.user;

  const { data: users } = await supabase
    .from("users")
    .select(
      `
      id,
      full_name,
      sales_rep_profile:sales_rep_profiles(commission_rate)
    `,
    )
    .eq("dealership_id", dealershipId)
    .eq("role", "sales_rep")
    .is("deleted_at", null)
    .order("full_name");

  const salesReps: MarkAsSoldSalesRepOption[] = (users ?? []).map((u) => {
    const profile = Array.isArray(u.sales_rep_profile)
      ? u.sales_rep_profile[0]
      : u.sales_rep_profile;
    const rate = Number(profile?.commission_rate ?? 0);
    return {
      id: u.id,
      fullName: u.full_name ?? "Unknown",
      commissionRate: Number.isFinite(rate) && rate > 0 ? rate * 100 : 10,
    };
  });

  return { salesReps };
}
