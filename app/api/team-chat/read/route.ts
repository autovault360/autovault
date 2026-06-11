import { NextRequest, NextResponse } from "next/server";
import {
  requireTeamChatAccess,
  teamChatAuthErrorResponse,
} from "@/lib/sales-rep/team-chat/server/auth";
import { markTeamChatRead } from "@/lib/sales-rep/team-chat/server/mark-team-read";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return teamChatAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const teamChatId = body.teamChatId as string | undefined;

    if (!teamChatId) {
      return NextResponse.json({ error: "teamChatId is required." }, { status: 400 });
    }

    const result = await markTeamChatRead(teamChatId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
