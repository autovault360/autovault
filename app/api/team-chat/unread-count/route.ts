import { NextResponse } from "next/server";
import {
  requireTeamChatAccess,
  teamChatAuthErrorResponse,
} from "@/lib/sales-rep/team-chat/server/auth";
import { getTeamChatUnreadCount } from "@/lib/sales-rep/team-chat/server/get-team-chat";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireTeamChatAccess();
  if (!auth.ok) return teamChatAuthErrorResponse(auth);

  const count = await getTeamChatUnreadCount();
  return NextResponse.json({ count });
}
