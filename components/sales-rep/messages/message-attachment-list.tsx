"use client";

import { Download, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/sales-rep/send-document/validation";
import type { MessageAttachment } from "@/lib/sales-rep/messages/types";

type Props = {
  attachments: MessageAttachment[];
};

async function downloadAttachment(attachment: MessageAttachment) {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: attachment.url,
      fileName: attachment.name,
      sendId: attachment.sendId,
      fileId: attachment.fileId,
    }),
  });

  if (!response.ok) return;

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = attachment.name;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export default function MessageAttachmentList({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <button
          key={attachment.fileId}
          type="button"
          onClick={() => downloadAttachment(attachment)}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-left transition hover:border-blue-500/40 hover:bg-slate-900/70"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-500/10 text-blue-400">
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium text-slate-200">
              {attachment.name}
            </span>
            <span className="text-[10px] text-slate-500">
              {formatFileSize(attachment.size)}
            </span>
          </span>
          <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        </button>
      ))}
    </div>
  );
}
