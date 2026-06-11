import { listConversations } from "./list-conversations";
import { formatMessageTime, truncatePreview } from "../calculations";
import type { ITeamMessage } from "@/lib/sales-rep/dashboard/types";

export async function getRecentTeamMessages(limit = 3): Promise<ITeamMessage[]> {
  const result = await listConversations({ page: 1, pageSize: 100, tab: "all" });

  return result.conversations
    .filter((entry) => entry.conversationId && entry.lastMessageText)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.conversationId!,
      name: entry.otherParticipant.fullName,
      avatarInitials: entry.otherParticipant.initials,
      message: truncatePreview(entry.lastMessageText, 80),
      timestamp: formatMessageTime(entry.lastMessageAt ?? entry.createdAt),
    }));
}
