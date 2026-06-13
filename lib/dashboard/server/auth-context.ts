import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  userId: string;
  dealershipId: string;
  role: string;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("dealership_id, role, is_active")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    userId: user.id,
    dealershipId: profile.dealership_id,
    role: profile.role,
  };
});
