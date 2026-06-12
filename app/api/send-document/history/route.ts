import { NextRequest, NextResponse } from "next/server";
import {
  requireSendDocumentAccess,
  sendDocumentAuthErrorResponse,
} from "@/lib/sales-rep/send-document/server/auth";
import { listSendHistory } from "@/lib/sales-rep/send-document/server/list-send-history";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return sendDocumentAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const result = await listSendHistory({
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
