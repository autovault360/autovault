"use client";

import { useCallback, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  repName: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const FOOTER_CARD_CONTENT_HEIGHT = "min-h-[88px]";

export default function SalesRepMessageBar({ repName }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message before sending.");
      return;
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
      return;
    }
    setError(null);
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  }, [message]);

  return (
    <Card className="flex h-full w-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h2 className="mb-2.5 shrink-0 text-[11px] font-bold tracking-[0.08em] text-white uppercase">
        Message {repName}
      </h2>

      <div
        className={cn(
          "relative flex flex-1 items-stretch",
          FOOTER_CARD_CONTENT_HEIGHT,
        )}
      >
        <textarea
          id="sales-rep-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Type your message..."
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          className={cn(
            "h-full w-full resize-none rounded-md border border-slate-700 bg-slate-800/50 px-3 py-3 pr-[7.5rem] text-[12px] leading-normal text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30",
            error && "border-red-500/50",
          )}
        />
        <div className="absolute inset-y-0 right-2.5 flex items-center gap-2">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800/50 hover:text-slate-300"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            className="h-8 gap-1.5 px-3.5 text-[11.5px] font-semibold"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 shrink-0 text-[11px] text-red-400" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="mt-1.5 shrink-0 text-[11px] text-emerald-400" role="status">
          Message sent successfully.
        </p>
      )}
    </Card>
  );
}
