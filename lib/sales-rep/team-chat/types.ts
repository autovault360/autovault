import type { MessageParticipant } from "@/lib/sales-rep/messages/types";

export type TeamChatMember = MessageParticipant;

export type TeamChatMessage = {
  id: string;
  teamChatId: string;
  senderId: string;
  sender: TeamChatMember;
  messageText: string;
  createdAt: string;
  isOwn: boolean;
  seenByCount: number;
  pending?: boolean;
  failed?: boolean;
};

export type TeamChatInfo = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  createdByName: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type TeamChatDetail = {
  chat: TeamChatInfo;
  members: TeamChatMember[];
  messages: TeamChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
};
