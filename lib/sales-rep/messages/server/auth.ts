import { NextResponse } from "next/server";
import { authenticateUser, type AuthUser } from "@/lib/vehicles/server/utils";

export type SalesRepMessagesAuth = AuthUser;

export type SalesRepMessagesAuthResult =
  | { ok: true; user: SalesRepMessagesAuth }
  | { ok: false; error: string; status: number };

export async function requireSalesRepMessagesAccess(): Promise<SalesRepMessagesAuthResult> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error, status: 401 };
  }

  if (auth.user.role !== "sales_rep") {
    return {
      ok: false,
      error: "Only sales representatives can access messages.",
      status: 403,
    };
  }

  return { ok: true, user: auth.user };
}

export function messagesAuthErrorResponse(
  result: Extract<SalesRepMessagesAuthResult, { ok: false }>,
) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
