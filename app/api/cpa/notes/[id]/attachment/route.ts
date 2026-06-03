import { NextRequest, NextResponse } from "next/server";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { uploadCpaNoteAttachment } from "@/lib/cpa/server/notes/upload-attachment";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    const attachment = await uploadCpaNoteAttachment(
      auth.user.dealershipId,
      auth.user.userId,
      id,
      file,
    );
    return NextResponse.json(attachment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
