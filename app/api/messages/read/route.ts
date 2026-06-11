import { NextRequest, NextResponse } from "next/server";
import {
  messagesAuthErrorResponse,
  requireSalesRepMessagesAccess,
} from "@/lib/sales-rep/messages/server/auth";
import { markConversationRead } from "@/lib/sales-rep/messages/server/mark-read";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const conversationId = body.conversationId as string | undefined;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required." },
        { status: 400 },
      );
    }

    const result = await markConversationRead(conversationId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
