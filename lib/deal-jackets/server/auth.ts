import { authenticateUser, type AuthUser } from "@/lib/vehicles/server/utils";

export type { AuthUser };

export async function requireDealJacketAuth(): Promise<
  { ok: true; user: AuthUser } | { ok: false; error: string; status: number }
> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: 401 };
  }
  return { ok: true, user: auth.user };
}

export function canManageDealJackets(role: AuthUser["role"]): boolean {
  return ["super_admin", "owner", "manager"].includes(role);
}
