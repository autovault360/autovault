import { NextResponse } from "next/server";
import {
  requireSendDocumentAccess,
  sendDocumentAuthErrorResponse,
} from "@/lib/sales-rep/send-document/server/auth";
import { listSendDocumentRecipients } from "@/lib/sales-rep/send-document/server/list-recipients";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return sendDocumentAuthErrorResponse(auth);

  const result = await listSendDocumentRecipients();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ recipients: result });
}
