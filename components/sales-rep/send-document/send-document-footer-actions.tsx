"use client";

import { Loader2, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  canSend: boolean;
  sending: boolean;
  sendStatus: "idle" | "success" | "error";
  onCancel: () => void;
  onSend: () => void;
};

export default function SendDocumentFooterActions({
  canSend,
  sending,
  sendStatus,
  onCancel,
  onSend,
}: Props) {
  return (
    <div className="mt-5 rounded-xl border border-slate-800/80 bg-[#0c111a] px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            theme="dark"
            onClick={onCancel}
            disabled={sending}
            className="h-9 min-w-[100px] border-slate-600 bg-transparent text-[12px] text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            theme="dark"
            onClick={onSend}
            disabled={!canSend}
            className="h-9 min-w-[150px] bg-violet-600 text-[12px] text-white hover:bg-violet-500 disabled:opacity-40"
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send Document
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-400/90">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>Your documents are encrypted and sent securely.</span>
        </div>
      </div>

      {sendStatus === "success" && (
        <p
          className={cn(
            "mt-2.5 text-[11px] font-medium text-emerald-400",
          )}
        >
          Documents sent successfully. The recipient will be notified shortly.
        </p>
      )}
      {sendStatus === "error" && (
        <p className="mt-2.5 text-[11px] font-medium text-red-400">
          Something went wrong. Please review your entries and try again.
        </p>
      )}
    </div>
  );
}
