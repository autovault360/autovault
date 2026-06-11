import { NextRequest, NextResponse } from "next/server";
import {
  messagesAuthErrorResponse,
  requireSalesRepMessagesAccess,
} from "@/lib/sales-rep/messages/server/auth";
import {
  getOrCreateConversation,
  listConversations,
  searchSalesReps,
} from "@/lib/sales-rep/messages/server/list-conversations";
import type { ConversationTab } from "@/lib/sales-rep/messages/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  const params = request.nextUrl.searchParams;
  const search = params.get("search") ?? undefined;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("limit") ?? "25");
  const tab = (params.get("tab") ?? "all") as ConversationTab;
  const repsOnly = params.get("reps") === "true";

  if (repsOnly) {
    const reps = await searchSalesReps(search ?? "");
    return NextResponse.json({ reps });
  }

  const result = await listConversations({ page, pageSize, tab, search });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const recipientId = body.recipientId as string | undefined;

    if (!recipientId) {
      return NextResponse.json({ error: "recipientId is required." }, { status: 400 });
    }

    const result = await getOrCreateConversation(recipientId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
