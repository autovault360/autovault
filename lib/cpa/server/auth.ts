import { NextResponse } from "next/server";
import { authenticateUser, type AuthUser } from "@/lib/vehicles/server/utils";
import {
  canAccessCpaPortal,
  canManageCpaNotes,
  isCpaReadOnly,
} from "./permissions";

export type CpaPortalAuth = AuthUser & {
  canManageNotes: boolean;
  isReadOnly: boolean;
};

export type CpaAuthResult =
  | { ok: true; user: CpaPortalAuth }
  | { ok: false; error: string; status: number };

export async function requireCpaPortalAccess(): Promise<CpaAuthResult> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: 401 };
  }

  if (!canAccessCpaPortal(auth.user.role)) {
    return {
      ok: false,
      error: "You do not have access to the CPA portal.",
      status: 403,
    };
  }

  return {
    ok: true,
    user: {
      ...auth.user,
      canManageNotes: canManageCpaNotes(auth.user.role),
      isReadOnly: isCpaReadOnly(auth.user.role),
    },
  };
}

export function cpaAuthErrorResponse(result: Extract<CpaAuthResult, { ok: false }>) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
