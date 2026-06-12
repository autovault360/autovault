import { NextRequest, NextResponse } from "next/server";
import {
  requireSendDocumentAccess,
  sendDocumentAuthErrorResponse,
} from "@/lib/sales-rep/send-document/server/auth";
import { listDocumentCenterFiles } from "@/lib/sales-rep/send-document/server/list-document-center-files";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return sendDocumentAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const result = await listDocumentCenterFiles({
    search: searchParams.get("search") ?? undefined,
    sourceEntity: searchParams.get("sourceEntity") ?? undefined,
    fileType: searchParams.get("fileType") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 50),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
