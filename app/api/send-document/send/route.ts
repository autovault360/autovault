import { NextRequest, NextResponse } from "next/server";
import {
  requireSendDocumentAccess,
  sendDocumentAuthErrorResponse,
} from "@/lib/sales-rep/send-document/server/auth";
import { sendDocuments } from "@/lib/sales-rep/send-document/server/send-document";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireSendDocumentAccess();
  if (!auth.ok) return sendDocumentAuthErrorResponse(auth);

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const recipientType = formData.get("recipientType") as "email" | "sales_rep" | null;
      const emailAddresses = (formData.get("emailAddresses") as string | null) ?? undefined;
      const salesRepId = (formData.get("salesRepId") as string | null) ?? undefined;
      const message = (formData.get("message") as string | null) ?? undefined;
      const fileIdsRaw = formData.get("fileIds") as string | null;
      const fileIds = fileIdsRaw ? (JSON.parse(fileIdsRaw) as string[]) : [];

      const uploads: File[] = [];
      for (const entry of formData.getAll("uploads")) {
        if (entry instanceof File && entry.size > 0) {
          uploads.push(entry);
        }
      }

      if (!recipientType) {
        return NextResponse.json({ error: "Recipient type is required." }, { status: 400 });
      }

      const result = await sendDocuments({
        recipientType,
        emailAddresses,
        salesRepId,
        message,
        fileIds,
        uploads,
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    }

    const body = await request.json();
    const result = await sendDocuments({
      recipientType: body.recipientType,
      emailAddresses: body.emailAddresses,
      salesRepId: body.salesRepId,
      message: body.message,
      fileIds: body.fileIds ?? [],
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
