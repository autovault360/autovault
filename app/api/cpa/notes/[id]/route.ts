import { NextRequest, NextResponse } from "next/server";
import { updateCpaNoteSchema } from "@/lib/cpa/actions/schemas";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { getCpaNote } from "@/lib/cpa/server/notes/get-note";
import { updateCpaNote } from "@/lib/cpa/server/notes/update-note";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const { id } = await params;
  const note = await getCpaNote(auth.user.dealershipId, id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  try {
    const { id } = await params;
    const body = await request.json();
    const input = updateCpaNoteSchema.parse(body);
    await updateCpaNote(
      auth.user.dealershipId,
      auth.user.userId,
      id,
      input,
      auth.user.canManageNotes,
    );
    const note = await getCpaNote(auth.user.dealershipId, id);
    return NextResponse.json(note);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
