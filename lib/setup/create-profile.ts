"use server";

import { createClient } from "@/lib/supabase/server";

export async function createMyProfile(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, error: "Profile already exists" };
  }

  const fullName = user.user_metadata?.full_name as string | undefined;
  const role = (user.user_metadata?.role as string) ?? "owner";
  const email = user.email ?? "";

  const { error: insertError } = await supabase.from("users").insert({
    auth_user_id: user.id,
    email,
    full_name: fullName ?? email.split("@")[0],
    role,
    is_active: true,
    dealership_id: null,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}
