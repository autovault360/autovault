import { NextRequest, NextResponse } from "next/server";
import {
  requireTeamChatAccess,
  teamChatAuthErrorResponse,
} from "@/lib/sales-rep/team-chat/server/auth";
import { getTeamChatDetail } from "@/lib/sales-rep/team-chat/server/get-team-chat";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return teamChatAuthErrorResponse(auth);

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");

  const result = await getTeamChatDetail({ cursor, limit });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
