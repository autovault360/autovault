"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { isCpaReadOnly } from "@/lib/cpa/server/permissions";

export async function assertNotReadOnlyPortalUser(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  if (isCpaReadOnly(auth.user.role)) {
    return {
      ok: false,
      error: "Read-only access: dealership data cannot be modified.",
    };
  }

  return { ok: true };
}
