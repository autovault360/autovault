"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SendHistoryItem } from "@/lib/sales-rep/send-document/server/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SendHistoryItem[];
  loading: boolean;
};

function formatSentAt(value: string): string {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(value: SendHistoryItem["readStatus"] | SendHistoryItem["downloadStatus"]) {
  switch (value) {
    case "read":
      return "Read";
    case "unread":
      return "Unread";
    case "downloaded":
      return "Downloaded";
    case "pending":
      return "Pending";
    default:
      return "N/A";
  }
}

export default function SendHistorySheet({
  open,
  onOpenChange,
  items,
  loading,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-slate-800 bg-[#0a101d] sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Send History</SheetTitle>
          <SheetDescription className="text-slate-400">
            Audit trail of documents sent through the Document Center.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-800 px-4 py-10 text-center text-[12px] text-slate-500">
              No documents have been sent yet.
            </div>
          ) : (
            <table className="min-w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="px-2 py-2 font-medium">Sender</th>
                  <th className="px-2 py-2 font-medium">Recipient</th>
                  <th className="px-2 py-2 font-medium">Documents</th>
                  <th className="px-2 py-2 font-medium">Sent</th>
                  <th className="px-2 py-2 font-medium">Method</th>
                  <th className="px-2 py-2 font-medium">Read</th>
                  <th className="px-2 py-2 font-medium">Download</th>
                  <th className="px-2 py-2 font-medium">Replies</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/70 text-slate-300">
                    <td className="px-2 py-3 align-top">{item.senderName}</td>
                    <td className="px-2 py-3 align-top">{item.recipientLabel}</td>
                    <td className="px-2 py-3 align-top">
                      <span title={item.documentNames.join(", ")}>
                        {item.documentCount} file{item.documentCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-2 py-3 align-top whitespace-nowrap">
                      {formatSentAt(item.sentAt)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {item.deliveryMethod === "email" ? "Email" : "Internal Message"}
                    </td>
                    <td className="px-2 py-3 align-top">{statusLabel(item.readStatus)}</td>
                    <td className="px-2 py-3 align-top">{statusLabel(item.downloadStatus)}</td>
                    <td className="px-2 py-3 align-top">
                      {item.conversationId ? (
                        <Link
                          href={`/sales-rep/messages?conversation=${item.conversationId}`}
                          className="text-violet-400 hover:text-violet-300"
                        >
                          View thread
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
