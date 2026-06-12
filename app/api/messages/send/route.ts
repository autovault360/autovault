import { NextRequest, NextResponse } from "next/server";
import {
  messagesAuthErrorResponse,
  requireSalesRepMessagesAccess,
} from "@/lib/sales-rep/messages/server/auth";
import { sendMessage } from "@/lib/sales-rep/messages/server/send-message";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const conversationId = body.conversationId as string | undefined;
    const recipientId = body.recipientId as string | undefined;
    const message = body.message as string | undefined;
    const fileIds = body.fileIds as string[] | undefined;

    if (!message?.trim() && (!fileIds || fileIds.length === 0)) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await sendMessage({ conversationId, recipientId, message: message ?? "", fileIds });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
