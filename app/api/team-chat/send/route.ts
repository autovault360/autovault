import { NextRequest, NextResponse } from "next/server";
import {
  requireTeamChatAccess,
  teamChatAuthErrorResponse,
} from "@/lib/sales-rep/team-chat/server/auth";
import { sendTeamMessage } from "@/lib/sales-rep/team-chat/server/send-team-message";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return teamChatAuthErrorResponse(auth);

  try {
    const body = await request.json();
    const message = body.message as string | undefined;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await sendTeamMessage(message);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
