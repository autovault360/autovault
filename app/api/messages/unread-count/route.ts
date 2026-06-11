import { NextRequest, NextResponse } from "next/server";
import {
  messagesAuthErrorResponse,
  requireSalesRepMessagesAccess,
} from "@/lib/sales-rep/messages/server/auth";
import { getTotalUnreadCount } from "@/lib/sales-rep/messages/server/list-conversations";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSalesRepMessagesAccess();
  if (!auth.ok) return messagesAuthErrorResponse(auth);

  const count = await getTotalUnreadCount();
  return NextResponse.json({ count });
}
