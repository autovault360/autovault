import { NextRequest, NextResponse } from "next/server";
import { createCpaNoteSchema } from "@/lib/cpa/actions/schemas";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { createCpaNote } from "@/lib/cpa/server/notes/create-note";
import { listCpaNotes } from "@/lib/cpa/server/notes/list-notes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = await listCpaNotes(auth.user.dealershipId, params);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const input = createCpaNoteSchema.parse(body);
    const note = await createCpaNote(
      auth.user.dealershipId,
      auth.user.userId,
      input,
    );
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
