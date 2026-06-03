import { NextRequest, NextResponse } from "next/server";
import { createCpaCommentSchema } from "@/lib/cpa/actions/schemas";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { addCpaNoteComment } from "@/lib/cpa/server/notes/add-comment";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  try {
    const { id } = await params;
    const body = await request.json();
    const input = createCpaCommentSchema.parse(body);
    const comment = await addCpaNoteComment(
      auth.user.dealershipId,
      auth.user.userId,
      id,
      input,
    );
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
