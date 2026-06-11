import { NextRequest, NextResponse } from "next/server";
import {
  messagesAuthErrorResponse,
  requireSalesRepMessagesAccess,
} from "@/lib/sales-rep/messages/server/auth";
import { getConversationDetail } from "@/lib/sales-rep/messages/server/get-conversation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  const { id } = await context.params;
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");

  const result = await getConversationDetail(id, { cursor, limit });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result);
}
