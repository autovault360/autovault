export type ConversationTab = "all" | "unread";

export type MessageParticipant = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  initials: string;
  role: string;
  isOnline: boolean;
  lastActiveAt: string | null;
};

export type ConversationListItem = {
  repId: string;
  conversationId: string | null;
  otherParticipant: MessageParticipant;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string | null;
};

export type ConversationsResponse = {
  conversations: ConversationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalUnread: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  messageText: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
  pending?: boolean;
  failed?: boolean;
  attachments?: MessageAttachment[];
};

export type MessageAttachment = {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  sendId?: string;
};

export type ConversationDetail = {
  id: string;
  createdAt: string;
  participants: MessageParticipant[];
  otherParticipant: MessageParticipant;
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  stats: ConversationStats;
};

export type ConversationStats = {
  totalMessages: number;
  unreadMessages: number;
  conversationStarted: string;
  lastActiveAt: string | null;
};

export type SalesRepSearchResult = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  initials: string;
  existingConversationId: string | null;
};
