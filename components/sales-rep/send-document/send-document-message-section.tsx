"use client";

import { Textarea } from "@/components/ui/textarea";
import { SEND_DOCUMENT_MESSAGE_MAX } from "@/lib/sales-rep/send-document/constants";
import SendDocumentSectionCard from "./send-document-section-card";

type Props = {
  message: string;
  messageError: string | null;
  onMessageChange: (value: string) => void;
};

export default function SendDocumentMessageSection({
  message,
  messageError,
  onMessageChange,
}: Props) {
  return (
    <SendDocumentSectionCard step={3} title="Add Message (Optional)">
      <Textarea
        theme="dark"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        maxLength={SEND_DOCUMENT_MESSAGE_MAX}
        showCount
        placeholder="Add a message for the recipient..."
        className="min-h-[120px] resize-none border-slate-700 bg-slate-900/50 text-[12px] text-slate-200"
        aria-invalid={!!messageError}
      />
      {messageError && (
        <p className="mt-1 text-[10.5px] text-red-400">{messageError}</p>
      )}
    </SendDocumentSectionCard>
  );
}
