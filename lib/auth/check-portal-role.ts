"use server";

import { createClient } from "@/lib/supabase/server";

const PORTAL_ROLES = {
  admin: ["super_admin", "owner", "manager"],
  cpa: ["super_admin", "owner", "manager", "cpa"],
  "sales-rep": ["sales_rep"],
} as const;

export type PortalType = keyof typeof PORTAL_ROLES;

export type PortalRoleCheck =
  | { ok: true; role: string }
  | { ok: false; reason: "unauthenticated" | "no_profile" | "wrong_role" };

export async function checkPortalRole(
  portal: PortalType,
): Promise<PortalRoleCheck> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return { ok: false, reason: "no_profile" };

  const allowedRoles = PORTAL_ROLES[portal];
  if (!allowedRoles.includes(profile.role as never)) {
    return { ok: false, reason: "wrong_role" };
  }

  return { ok: true, role: profile.role };
}
