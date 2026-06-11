"use client";

import ChatMessageBubble from "@/components/sales-rep/chat/chat-message-bubble";
import type { ChatMessage, MessageParticipant } from "@/lib/sales-rep/messages/types";

type Props = {
  message: ChatMessage;
  sender: MessageParticipant;
};

export default function MessageBubble({ message, sender }: Props) {
  return (
    <ChatMessageBubble
      mode="direct"
      sender={sender}
      message={{
        id: message.id,
        messageText: message.messageText,
        createdAt: message.createdAt,
        isOwn: message.isOwn,
        pending: message.pending,
        failed: message.failed,
        isRead: message.isRead,
      }}
    />
  );
}
