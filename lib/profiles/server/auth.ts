"use server";

import { authenticateUser, type AuthUser } from "@/lib/vehicles/server/utils";

const PROFILE_ROLES = new Set<AuthUser["role"]>([
  "sales_rep",
  "wholesale_dealer",
  "cpa",
]);

export type ProfileAuthResult =
  | {
      ok: true;
      userId: string;
      dealershipId: string;
      role: AuthUser["role"];
    }
  | { ok: false; error: string };

export async function authenticateForProfile(): Promise<ProfileAuthResult> {
  const auth = await authenticateUser();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!PROFILE_ROLES.has(auth.user.role)) {
    return { ok: false, error: "You do not have permission to manage this profile" };
  }

  return {
    ok: true,
    userId: auth.user.userId,
    dealershipId: auth.user.dealershipId,
    role: auth.user.role,
  };
}
