import { NextRequest, NextResponse } from "next/server";
import {
  requireSendDocumentAccess,
  sendDocumentAuthErrorResponse,
} from "@/lib/sales-rep/send-document/server/auth";
import { uploadDocumentCenterFile } from "@/lib/sales-rep/send-document/server/upload-document-center-file";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return sendDocumentAuthErrorResponse(auth);

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const result = await uploadDocumentCenterFile(file);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
}
