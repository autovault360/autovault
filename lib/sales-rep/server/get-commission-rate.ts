"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentSalesRepCommissionRate(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data: profile } = await supabase
    .from("users")
    .select("sales_rep_profile:sales_rep_profiles(commission_rate)")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return 0;

  const nested = profile.sales_rep_profile as
    | { commission_rate: number | null }
    | { commission_rate: number | null }[]
    | null;

  const raw = Array.isArray(nested) ? nested[0]?.commission_rate : nested?.commission_rate;
  const rate = Number(raw);
  return Number.isFinite(rate) && rate >= 0 ? rate : 0.1;
}
